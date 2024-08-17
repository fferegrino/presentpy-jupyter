import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

// import { requestAPI } from './handler';

import { INotebookTracker } from '@jupyterlab/notebook';

// import { ToolbarButton } from '@jupyterlab/apputils';

// import { downloadIcon } from '@jupyterlab/ui-components';

import { ServerConnection } from '@jupyterlab/services';

/**
 * Initialization data for the presentpy_jupyter extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'presentpy_jupyter:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  optional: [ISettingRegistry, INotebookTracker],
  activate: (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry | null,
    notebooks: INotebookTracker
  ) => {
    console.log('JupyterLab extension presentpy_jupyter is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('presentpy_jupyter settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error(
            'Failed to load settings for presentpy_jupyter.',
            reason
          );
        });
    }

    const { commands } = app;

    const command = 'presentpy_jupyter:convert';

    // Add a command
    commands.addCommand(command, {
      label: 'ODP',
      caption: 'Export to ODP',
      execute: async (args: any) => {
        const extensionSettings = await settingRegistry?.load(plugin.id);
        const path = notebooks.currentWidget?.sessionContext.path;
        const orig = args['origin'];
        if (orig !== 'init') {
          const settings = ServerConnection.makeSettings();
          const requestUrl = `${settings.baseUrl}presentpy-jupyter/download`;
          try {
            const theme =
              (extensionSettings?.get('theme').composite as string) ||
              'default';
            const keep_odp =
              (extensionSettings?.get('keep_odp').composite as boolean) ||
              false;
            console.log(
              `Converting ${path} to ODP with theme ${theme} and keep_odp ${keep_odp}`
            );
            const response = await ServerConnection.makeRequest(
              requestUrl,
              {
                method: 'POST',
                body: JSON.stringify({
                  path: path,
                  theme: theme,
                  keep_odp: keep_odp
                })
              },
              settings
            );

            if (response.status !== 200) {
              const data = await response.json();
              throw new Error(data.message || 'Unknown error');
            }
            const notebook_name = path?.split('/').pop() || 'notebook.ipynb';
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${notebook_name.split('.')[0]}.odp`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error('Failed to download notebook:', error);
          }
        }
      }
    });

    // Call the command execution
    commands.execute(command, { origin: 'init' }).catch(reason => {
      console.error(
        `An error occurred during the execution of jlab-examples:command.\n${reason}`
      );
    });
  }
};

export default plugin;
