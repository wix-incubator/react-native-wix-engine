const childProcess = require('child_process');
const _ = require('lodash');
const {Logger} = require('../utils/Logger');
const {Adb} = require('../utils/Adb');

class AsyncPackagerRunner {
  run(engineDir, resetCache, port) {
    Adb.reverse('metro bundler', port);

    const rnStartCmdArray = [
      'node',
      'node_modules/react-native/local-cli/cli.js',
      'start',
      '--port',
      port,
      engineDir,
    ];

    if (resetCache) {
      rnStartCmdArray.push('--reset-cache');
    }

    const cwd = `${engineDir}/../..`;
    Logger.info(`Running in background: ${Logger.color(`cd ${cwd} ${rnStartCmdArray.join(' ')}`, 'quote')}`);

    const packager = childProcess.spawn(
      rnStartCmdArray[0],
      rnStartCmdArray.slice(1),
      {
        cwd,
        stdio: 'inherit',
      },
    );
    packager.on('exit', () => Logger.info(`The packager process finished`));

    return packager;
  }
}

module.exports = {AsyncPackagerRunner};
