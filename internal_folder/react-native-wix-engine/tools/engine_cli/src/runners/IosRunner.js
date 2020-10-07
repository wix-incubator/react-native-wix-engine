const childProcess = require('child_process');
const _ = require('lodash');
const {promisify} = require('util');
const {Logger} = require('../utils/Logger');
const fs = require('fs');
const retry = require('../utils/retry');

const asyncExec = promisify(childProcess.exec);

const BundleIds = {
  dev: 'com.wix.engine.dev',
  release: 'TBD',
};

class IosRunner {
  constructor(packagerWatcher, devicesNames, udids) {
    this._packagerWatcher = packagerWatcher;
    this._devicesNames = devicesNames;
    this._udids = udids;
  }

  async run(engineDir, buildType, disableUninstall, target) {
    const devices = this._getDevices();
    let udids;

    if (this._udids) {
      udids = this._parseUdids(this._udids);
    } else if (this._devicesNames) {
      udids = this._findDevicesByNames(devices);
      if (udids.length === 0) {
        throw new Error(`Couldn't find devices matching the names '${this._devicesNames}'`);
      }
    } else {
      udids = this._getBootedDevicesIds(devices);
    }

    const bundleId = BundleIds[buildType];
    await Promise.all(_.map(udids, async (udid) => {
      await this._bootDeviceIfNeeded(devices, udid);
      if (!disableUninstall) {
        await this._uninstallApp(udid, bundleId);
      }

      await retry({retries: 2, interval: 500}, async () => {
        await this._installApp(udid, engineDir, buildType, target);
      });

      await this._packagerWatcher.waitUntilUp();
      await this._launchApp(udid, bundleId);
    }));
  }

  _findDevicesByNames(allDevices) {
    const matchineDevices = _.filter(allDevices, (device) => this._devicesNames.indexOf(device.name) !== -1);
    return _.map(matchineDevices, 'udid');
  }

  _parseUdids(udids) {
    return udids.split(',');
  }

  _getBootedDevicesIds(allDevices) {
    const bootedDevices = _.filter(allDevices, {state: 'Booted'});
    return _.map(bootedDevices, 'udid');
  }

  _getDevices() {
    const devicesJson = JSON.parse(childProcess.execSync(`xcrun simctl list -j devices`));
    return _.flatten(_.values(devicesJson.devices));
  }

  async _bootDeviceIfNeeded(allDevices, udid) {
    const device = _.filter(allDevices, {udid})[0];
    if (device.state === 'Booted') {
      return;
    }

    Logger.info(`Booting iOS device ${udid}`);
    await asyncExec(`xcrun simctl boot ${udid}`);
  }

  async _uninstallApp(deviceUdid, bundleId) {
    Logger.info(`Uninstalling from iOS device ${deviceUdid}`);
    await asyncExec(`xcrun simctl uninstall ${deviceUdid} ${bundleId}`);
  }

  _buildApp(buildType, target) {
    const {NativeBuilds} = require('../../../native_builds/index');
    NativeBuilds.buildIOS(target, buildType);
  }
  _buildAppIfNotExist(engineDir, buildType, target) {
    const appPath = `${engineDir}/app_builds/${target.name}/${buildType}/ReactNativeWixEngine.${target.ext}`;
    if (!fs.existsSync(appPath)) {
      Logger.info(`Binary of ${Logger.colorQuote(buildType)} for ${Logger.colorQuote(target.name)}  is not available at ${Logger.colorQuote(appPath)}, Building it.....`);
      this._buildApp(buildType, target);
    }
    return appPath;
  }
  async _installApp(deviceUdid, engineDir, buildType, target) {
    const appPath = this._buildAppIfNotExist(engineDir, buildType, target);
    Logger.info(`Installing on iOS device ${deviceUdid}`);
    await asyncExec(`xcrun simctl install ${deviceUdid} ${appPath}`);
  }

  async _launchApp(deviceUdid, bundleId) {
    Logger.info(`Launching app ${bundleId} on device ${deviceUdid}.` +
                ` You can watch the device logs by running:\n` +
                `xcrun simctl spawn ${deviceUdid} log stream --level debug --style compact --predicate 'process=="ReactNativeWixEngine" && subsystem=="com.facebook.react.log"'`);
    await asyncExec(`xcrun simctl launch ${deviceUdid} ${bundleId}`);
  }
}

module.exports = {IosRunner};
