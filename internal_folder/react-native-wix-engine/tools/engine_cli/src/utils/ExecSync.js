const {Logger} = require('./Logger');

const childProcess = require('child_process');

module.exports = function (command, logFileName, fatal = true) {
  const logFilePath = `${process.env.TMPDIR}${logFileName}`;
  const fullCommand = logFileName !== undefined ? `${command} > ${logFilePath} 2>&1` : command;
  Logger.info(`Running synchronously: ${Logger.color(fullCommand, 'quote')}`);

  try {
    return childProcess.execSync(fullCommand, {stdio: 'inherit'});
  } catch (ex) {
    Logger.info(`The above command failed. Check the log ${Logger.color(logFilePath, 'quote')} for details. Error: ${Logger.color(ex, 'error')}`);
    if (fatal) {
      process.exit(1);
    }
  }
};
