const fs = require('fs');
const childProcess = require('child_process');
const {Logger} = require('../utils/Logger');

const ADB_PATH = `${process.env.ANDROID_HOME}/platform-tools/adb`;

class Adb {

  /**
     * @throws Error if adb is not installed in the path ANDROID_HOME/platform-tools/adb
     */
  constructor() {
    this._assertAdbCommandExists();
  }

  _assertAdbCommandExists() {
    if (!fs.existsSync(ADB_PATH)) {
      Logger.warning(`ANDROID_HOME not defined or ${ADB_PATH} not found, will not run adb reverse`);
    }
  }

  /**
     * starts the adb server
     */
  startServer() {
    Logger.info(`Starting ADB server.....`);
    childProcess.execSync(`${ADB_PATH} start-server`);
  }
  /**
     * make reverse to a port using adb server
     * it reverses all the devices for the given port
     * @param type for info logs
     * @param port the port to do reverse for the available devices
     */
  reverse(type, port) {
    let devices;
    try {
      const devicesOutput = childProcess.execSync(`${ADB_PATH} devices | tail -n +2 | cut -sf 1`);
      devices = String(devicesOutput).trim().split('\n');
    } catch (ex) {
      Logger.info(`Couldn't get android devices list, will not run adb reverse for ${type} (caught exception '${ex}')`);
      return;
    }

    for (const device of devices) {
      if (device === '') {
        continue;
      }
      Logger.info(`Running adb reverse for port ${port} (${type}) for device ${device}`);
      childProcess.execSync(`${ADB_PATH} -s ${device} reverse tcp:${port} tcp:${port}`);
    }
  }
}

module.exports = {
  Adb: new Adb()
};
