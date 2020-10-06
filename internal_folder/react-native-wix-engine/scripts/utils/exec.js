const cp = require('child_process');
const _ = require('lodash');

function execSync(command) {
  exec(command, 'inherit');
}

function execRead(command) {
  return _.trim(String(exec(command, 'pipe')));
}

function execSyncSilent(command) {
  exec(command, 'ignore');
}

function kill(process) {
  execSyncSilent(`pkill -f "${process}" || true`);
}

module.exports = {
  execSync,
  execSyncSilent,
  execRead,
  kill
};

function exec(command, stdout) {
  const normalized = normalizeSpace(command);
  console.log(normalized);
  return cp.execSync(normalized, {stdio: ['inherit', stdout, 'inherit']});
}

const WHITESPACE_REGEX = /\s+/g;

function normalizeSpace(str) {
  if (!_.isString(str)) {
    return undefined;
  }
  return _.replace(_.trim(str), WHITESPACE_REGEX, ' ');
}
