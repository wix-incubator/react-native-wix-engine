import autobind from 'react-autobind';

export class AppLauncher {
  constructor({navigator, moduleManager}) {
    this.navigator = navigator;
    this.moduleManager = moduleManager;
    autobind(this);
  }

  /**
   * launch the js application, evantually it will call setRoot in navigation as a function of the state
   * @param appAlreadyLaunched
   * @returns {Promise<void>}
   */
  async launch(appAlreadyLaunched) {
    const tabs = this.moduleManager.getTabs();
    await this.navigator.startTabbedApp(tabs);
  }
}
