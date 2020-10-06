const execSync = require('child_process').execSync;

class Configurator {
  configure() {
    // this is just a workaround - instead, we need to create the builds without js bundles
    execSync(`${__dirname}/../../engine_cli/bin/generate_configuration -r . -j ${__dirname}/../../../../../demo-modules/moduleList.json`);
  }
}

module.exports = {
  Configurator
};
