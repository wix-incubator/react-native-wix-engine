const {IOSBuilder} = require('./modules/IOSBuilder');
const {AndroidBuilder} = require('./modules/AndroidBuilder');
const {Configurator} = require('./modules/Configurator');
class NativeBuilds {
  constructor() {
    this._configured = false;
  }

  _configure() {
    if (!this._configured) {
      new Configurator().configure();
      this._configured = true;
    }
  }

  buildIOS(platform, buildType) {
    this._configure();
    const iOSBuilder = new IOSBuilder();
    iOSBuilder.build(platform, buildType);
  }

  buildAndroid(buildType) {
    this._configure();
    const androidBuilder = new AndroidBuilder();
    androidBuilder.build(buildType);
  }
}

module.exports = {
  NativeBuilds: new NativeBuilds(),
};
