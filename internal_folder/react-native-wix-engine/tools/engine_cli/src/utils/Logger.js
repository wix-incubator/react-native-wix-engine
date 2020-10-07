const colors = require('colors/safe');

class Logger {
  constructor() {
    colors.setTheme({
      info: 'grey',
      error: 'red',
      quote: 'white',
      output: 'cyan',
      warning: 'magenta',
      fatal: 'red'
    });
  }

  info(msg, appendNewLine = true) {
    this._log('info', msg, appendNewLine);
  }

  error(msg, appendNewLine = true) {
    this._log('error', msg, appendNewLine);
  }

  warning(msg, appendNewLine = true) {
    this._log('warning', msg, appendNewLine);
  }

  quote(msg, appendNewLine = true) {
    this._log('quote', msg, appendNewLine);
  }

  output(msg, appendNewLine = true) {
    this._log('output', msg, appendNewLine);
  }

  fatal(msg, errorCode = 1, appendNewLine = true) {
    this._log('fatal', msg, appendNewLine);
    process.exit(errorCode);
  }

  color(string, type) {
    return colors[type](string);
  }

  colorQuote(string) {
    return colors.quote(string);
  }

  _log(type, msg, appendNewLine) {
    process.stdout.write(colors[type](msg + (appendNewLine ? '\n' : '')));
  }
}

module.exports = {
  Logger: new Logger()
};
