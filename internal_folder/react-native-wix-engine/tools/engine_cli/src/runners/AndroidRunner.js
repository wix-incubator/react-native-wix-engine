const childProcess = require('child_process');
const {Logger} = require('../utils/Logger');
const {promisify} = require('util');
const _ = require('lodash');
const fs = require('fs');

const asyncExec = promisify(childProcess.exec);

const PackageId = {
  dev: 'com.reactnativewixengine',
  release: 'TBD',
};

class AndroidRunner {
  constructor(packagerWatcher) {
    this._packagerWatcher = packagerWatcher;

    if (!process.env.ANDROID_HOME) {
      throw new Error('ANDROID_HOME is undefined');
    }

    this._adb = `${process.env.ANDROID_HOME}/platform-tools/adb`;
  }

  async run(engineDir, buildType, disableUninstall) {
    const devices = this._getBootedDevices();
    Logger.info(`Found devices: ${devices}`);

    const packageId = PackageId[buildType];

    await Promise.all(
      _.map(devices, async device => {
        if (device === '') {
          return;
        }

        if (!disableUninstall) {
          await this._uninstallApp(device, packageId);
        }
        await this._installApp(device, engineDir, buildType);
        //await this._permitOverlay(device, packageId);
        await this._packagerWatcher.waitUntilUp();
        await this._launchApp(device, packageId);
      }),
    );
  }

  _getBootedDevices() {
    const output = childProcess.execSync(
      `${this._adb} devices | tail -n +2 | cut -sf 1`,
    );
    return String(output)
      .trim()
      .split('\n');
  }

  async _uninstallApp(device, packageId) {
    const packagesCmdResult = await asyncExec(
      `${this._adb} -s ${device} shell pm list packages`,
    );
    if (!packagesCmdResult.stdout.match(new RegExp(`:${packageId}\\n`))) {
      Logger.info(
        `The package ${packageId} is not installed, skipping uninstallation`,
      );
      return;
    }

    Logger.info(`Uninstalling from android device ${device}`);
    await asyncExec(`${this._adb} -s ${device} uninstall ${packageId}`);
  }

  _buildApp(buildType) {
    const {NativeBuilds} = require('../../../native_builds/index');
    NativeBuilds.buildAndroid(buildType);
  }
  _buildAppIfNotExist(engineDir, buildType) {
    const appPath = `${engineDir}/app_builds/android/${buildType}/ReactNativeWixEngine.apk`;
    if (!fs.existsSync(appPath)) {
      Logger.info(
        `Binary of ${Logger.colorQuote(
          buildType,
        )} is not available at ${Logger.colorQuote(appPath)}, Building it.....`,
      );
      this._buildApp(buildType);
    }
    return appPath;
  }

  async _installApp(device, engineDir, buildType) {
    const appPath = this._buildAppIfNotExist(engineDir, buildType);
    Logger.info(`Installing on android device ${device}`);
    await asyncExec(`${this._adb} -s ${device} install -r ${appPath}`);
  }

  async _permitOverlay(device, packageId) {
    Logger.info(`Granting permissions for overlay on the device ${device}`);
    await asyncExec(
      `${
        this._adb
      } -s ${device} shell pm grant ${packageId} android.permission.SYSTEM_ALERT_WINDOW`,
    );
  }

  async _launchApp(device, packageId) {
    Logger.info(`Launching app ${packageId} on device ${device}`);
    await asyncExec(
      `${
        this._adb
      } -s ${device} shell monkey -p ${packageId} -c android.intent.category.LAUNCHER 1`,
    );
  }
}

module.exports = {AndroidRunner};
