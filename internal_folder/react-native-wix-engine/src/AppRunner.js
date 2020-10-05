/**
 * It will run the application init the logic and call launch to set Root
 */
class AppRunner {
  constructor({engineConfig, moduleGenerators} = {}) {
    this._engineAlreadyInitialized = false;
    this._engineConfig = engineConfig;
    this._moduleGenerators = moduleGenerators;
    this.listenToNativeAppLaunch = this.listenToNativeAppLaunch.bind(this);
    this._startEngine = this._startEngine.bind(this);
  }

  listenToNativeAppLaunch() {
    require('react-native-navigation')
      .Navigation.events()
      .registerAppLaunchedListener(async () => {
        this._startEngine();
      });
  }

  async _startEngine() {
    try {
      // In Android, there are cases where the Activity destroyed, but JS context still in memory,
      // in this case we just need to start the Activity again (via react-native-navigation),
      // instead initialize the engine again (fast reload)
      if (!this._engineAlreadyInitialized) {
        const engineInitializer = require('./EngineInitializer');
        this._launchFunc = await engineInitializer.initEngine(
          this._engineConfig,
          this._moduleGenerators,
        );
      }

      if (this._launchFunc) {
        await this._launchFunc(this._engineAlreadyInitialized);
      }

      this._engineAlreadyInitialized = true;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * tests that the app (js) already launched and not from dead state
   * @returns {boolean}
   */
  isAppLaunched() {
    return this._engineAlreadyInitialized;
  }
}

module.exports = AppRunner;
