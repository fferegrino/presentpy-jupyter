import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the presentpy_js extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'presentpy_js:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension presentpy_js is activated!');

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
};

export default plugin;
