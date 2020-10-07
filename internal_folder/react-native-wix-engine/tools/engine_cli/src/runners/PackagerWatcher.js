const fetch = require('node-fetch');
const {sleep} = require('../utils/Sleep');
const {Logger} = require('../utils/Logger');

class PackagerWatcher {
  constructor(port, disabled) {
    this._started = undefined;
    this._waitingCallbacks = [];
    this._port = port;
    this._disabled = disabled;
  }

  async validateDown() {
    return this._disabled || !await this._ping();
  }

  async startWatchingUntilUp() {
    if (this._disabled) {
      return;
    }

    this._started = false;
    while (!await this._ping()) {
      await sleep(100);
    }

    this._started = true;
    for (const callback of this._waitingCallbacks) {
      callback();
    }
    this._waitingCallbacks = [];
  }

  async waitUntilUp() {
    if (this._disabled) {
      return;
    }

    if (this._started === undefined) {
      throw new Error('startWatchingUntilUp() should be called prior to waitUntilUp()');
    }

    if (this._started) {
      return;
    }

    Logger.info('Waiting for the packager to respond..');
    return new Promise((resolve) => this._waitingCallbacks.push(resolve));
  }

  async _ping() {
    try {
      await fetch(`http://localhost:${this._port}`);
      return true;
    } catch (ex) {
      if (ex.message.includes('ECONNREFUSED')) {
        return false;
      }
      throw ex;
    }
  }
}

module.exports = {
  PackagerWatcher
};
