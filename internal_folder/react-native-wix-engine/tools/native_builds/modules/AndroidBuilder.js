const os = require('os');
const execSync = require('child_process').execSync;
const AndroidBuildVariant = require('../AndroidBuildVariants');

class AndroidBuilder {
  constructor() {
    this._repoDir = `${__dirname}/../../../../..`;
    this._engineAndroidDir = `${
      this._repoDir
    }/internal_folder/react-native-wix-engine/android`;
  }

  build(buildType) {
    const {config} = AndroidBuildVariant[buildType];
    const _i = os.platform() === 'darwin' ? `-i ''` : `-i`;

    execSync(
      `internal_folder/react-native-wix-engine/android/gradlew \
      -Duser.dir=${__dirname}/../../../../../internal_folder/react-native-wix-engine/android \
      app:assemble${config} \
      -DVERSION_CODE=1 \
      -DVERSION_NAME=999.999.999 \
    `,
      {stdio: 'inherit'},
    );
    const destinationDir = `${
      this._repoDir
    }/internal_folder/react-native-wix-engine/app_builds/android/${buildType}`;
    execSync(`rm -rf ${destinationDir} && mkdir -p ${destinationDir}`);
    const app = `${
      this._engineAndroidDir
    }/app/build/outputs/apk/${config}/app-${config}.apk`;
    const destinationApp = `${destinationDir}/ReactNativeWixEngine.apk`;
    execSync(`cp -a ${app} ${destinationApp}`);
  }
}

module.exports = {
  AndroidBuilder,
};
