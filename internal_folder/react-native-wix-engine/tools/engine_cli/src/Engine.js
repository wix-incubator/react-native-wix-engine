const {ArgumentParser} = require('argparse');
const {AsyncPackagerRunner} = require('./runners/AsyncPackagerRunner');
const {IosRunner} = require('./runners/IosRunner');
const {AndroidRunner} = require('./runners/AndroidRunner');
const {Logger} = require('./utils/Logger');
const {PackagerWatcher} = require('./runners/PackagerWatcher');
const {RNCLIConfigValidator} = require('./runners/RNCLIConfigValidator');
const {GenerateConfiguration} = require('./GenerateConfiguration');
const BuildType = require('../../native_builds/BuildType');
const {simulator} = require('../../native_builds/BuildPlatforms');

function parseArgs() {
  const parser = new ArgumentParser();

  parser.addArgument(['-i', '--run-ios'], {
    help:
      'uninstall, install, and run the app on iOS simulators; ' +
      "unless '--ios-devices' option is used, all open iOS simulators will be used",
    action: 'storeTrue',
  });

  parser.addArgument(['-a', '--run-android'], {
    help: 'uninstall, install and run the app on connected Android devices',
    action: 'storeTrue',
  });

  parser.addArgument(['-U', '--disable-uninstall'], {
    help:
      'when used with -i or -a, this option prevents uninstallation of the app from the device; ' +
      'this means that you will get the old session',
    action: 'storeTrue',
  });

  parser.addArgument(['-n', '--native-build-type'], {
    defaultValue: BuildType.dev,
    choices: Object.values(BuildType),
    help: 'native build type to install',
  });

  parser.addArgument(['-p', '--custom-config-json'], {
    help:
      'path to configuration json (the default is package.json in the current dir)',
  });

  parser.addArgument(['--ios-devices'], {
    help:
      "list of iOS devices names as they appear in 'xcrun simctl list devices -j', separated by commas; " +
      "this is used together with '--run-ios' but allows to run on named devices instead of running ones",
  });

  parser.addArgument(['--ios-udids'], {
    help:
      "list of iOS udids as they appear in 'xcrun simctl list devices -j', separated by commas; " +
      "this is used together with '--run-ios' but allows to run on named devices instead of running ones",
  });

  parser.addArgument(['-P', '--no-packager'], {
    help: "Don't start the packager",
    action: 'storeTrue',
  });

  parser.addArgument(['--reset-cache'], {
    help: 'Reset packager cache',
    action: 'storeTrue',
  });

  parser.addArgument(['--packager-port'], {
    help: 'Port to run the packager on',
    defaultValue: '8081',
  });

  parser.addArgument(['--force-localhost'], {
    help:
      "Don't identify the ip, always use 127.0.0.1; this is a preferred method if you are not using " +
      'iOS physical device - otherwise switching networks require restarting the engine CLI',
    action: 'storeTrue',
  });

  parser.addArgument('ignored', {isPositional: true, nargs: '*'});
  return parser.parseArgs();
}

async function run(args) {
  let packagerProcess;
  try {
    const engineDir = `${__dirname}/../../..`;

    new RNCLIConfigValidator().run();

    new GenerateConfiguration().run({
      root_path: `${engineDir}/../..`,
      package_json_path:
        args.custom_config_json || `${process.cwd()}/package.json`,
      watch: false,
      force_localhost: args.force_localhost,
    });

    const packagerWatcher = new PackagerWatcher(
      args.packager_port,
      args.no_packager,
    );

    if (!(await packagerWatcher.validateDown())) {
      Logger.error(
        "Detected packager running, can't run another one. " +
          'If you intentionally started it separately, use the -P option. ' +
          `To run the running packager process, use 'lsof -i :${
            args.packager_port
          }'.`,
      );
      process.exit();
    }
    packagerWatcher.startWatchingUntilUp();

    if (!args.no_packager) {
      packagerProcess = new AsyncPackagerRunner().run(
        engineDir,
        args.reset_cache,
        args.packager_port,
      );
    }

    await Promise.all([
      (async () => {
        if (args.run_ios) {
          const iosRunner = new IosRunner(
            packagerWatcher,
            args.ios_devices,
            args.ios_udids,
          );
          await iosRunner.run(
            engineDir,
            args.native_build_type,
            args.disable_uninstall,
            simulator,
          );
        }
      })(),
      (async () => {
        if (args.run_android) {
          const androidRunner = new AndroidRunner(packagerWatcher);
          await androidRunner.run(
            engineDir,
            args.native_build_type,
            args.disable_uninstall,
          );
        }
      })(),
    ]);
  } catch (ex) {
    Logger.error(ex);
    packagerProcess.kill();
    process.exit(1);
  }
}

module.exports = {run, parseArgs};
