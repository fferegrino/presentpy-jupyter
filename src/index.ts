import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { requestAPI } from './handler';

/**
 * Initialization data for the presentpy_jupyter extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'presentpy_jupyter:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
    console.log('JupyterLab extension presentpy_jupyter is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('presentpy_jupyter settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for presentpy_jupyter.', reason);
        });
    }

    requestAPI<any>('get-example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The presentpy_jupyter server extension appears to be missing.\n${reason}`
        );
      });


    const { commands } = app;

    const command = 'presentpy_jupyter:convert';

    // Add a command
    commands.addCommand(command, {
      label: 'ODP',
      caption: 'Export to ODP',
      execute: (args: any) => {
        const orig = args['origin'];
        console.log(`presentpy_jupyter:command has been called from ${orig}.`);
        if (orig !== 'init') {

          requestAPI<any>('get-example')
          .then(data => {
            console.log(data);
          })
          .catch(reason => {
            console.error(
              `The presentpy_jupyter server extension appears to be missing.\n${reason}`
            );
          });

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
