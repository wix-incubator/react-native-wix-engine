const execSync = require('child_process').execSync;
const _ = require('lodash');

const IOSBuildFlavors = {
  dev: {scheme: 'ReactNativeWixEngine', config: 'Debug', flavorDir: 'Debug'},
};

class IOSBuilder {
  constructor() {
    this._repoDir = `${__dirname}/../../../../..`;
    this._engineIosDir = `${this._repoDir}/internal_folder/react-native-wix-engine/ios`;
    this._workspacePath = `${this._engineIosDir}/ReactNativeWixEngine.xcworkspace`;
    this._xcodebuildTargetDir = `${this._repoDir}/build/Products/Release-iphoneos`;
  }

  build(platform, buildType) {
    console.log(`Building app binary for platform: ${JSON.stringify(platform)} of type ${buildType}`);
    const binaryPath = this._buildiOSBinary(platform, buildType, '999.999.999');
    return binaryPath;
  }

  _buildiOSBinary(platform, buildType, version) {
    const buildFlavor = IOSBuildFlavors[buildType];
    const archivePath = this._archivePath(buildFlavor.scheme, version);
    const configuration = buildFlavor.config;

    const buildCommand = `RCT_NO_LAUNCH_PACKAGER=true xcodebuild \
      -workspace "${this._workspacePath}" \
      -scheme "${buildFlavor.scheme}" \
      -configuration ${configuration} \
      -sdk ${platform.name} \
      -archivePath '${archivePath}' \
      -derivedDataPath ${this._engineIosDir}/DerivedData/ReactNativeWixEngine \
      -UseModernBuildSystem=YES \
      ${platform.buildCmd} -quiet
    `;

    console.log('Executing:', buildCommand);
    execSync(buildCommand, {stdio: 'inherit'});

    let binaryPath;
    console.log(`Build command:${platform.buildCmd}`);
    if (platform.buildCmd === 'build') {
      binaryPath = this._copyToAppBuilds(platform, buildType, buildFlavor);
    } else {// archive
      binaryPath = this._extractIpa(buildType, version);
    }

    return binaryPath;
  }

  _copyToAppBuilds(platform, buildType, buildFlavor) {
    const source = `${this._engineIosDir}/DerivedData/ReactNativeWixEngine/build/Products/${buildFlavor.flavorDir}-${platform.name}/ReactNativeWixEngine.${platform.ext}`;
    const destinationDir = `${this._repoDir}/internal_folder/react-native-wix-engine/app_builds/${platform.name}/${buildType}`;
    execSync(`mkdir -p ${destinationDir}`);
    const destination = `${destinationDir}/ReactNativeWixEngine.app`;
    execSync(`rm -rf ${destination}`);
    const copyCommand = `cp -a '${source}' '${destination}'`;
    console.log(`Copying: ${copyCommand}`);
    execSync(copyCommand);
    return destination;
  }

  _extractIpa(buildType, version) {
    const buildFlavor = IOSBuildFlavors[buildType];
    const configuration = buildFlavor.flavorDir;
    const archivePath = this._archivePath(buildFlavor.scheme, version);
    const tempDir = execSync('mktemp -d /tmp/EngineBuild.XX').toString().trim();
    const xcodeBuildCommand = `xcodebuild -exportArchive \
    -UseModernBuildSystem=NO \
    -archivePath "${archivePath}" \
    -exportOptionsPlist "${this._engineIosDir}/exportOptions${configuration}.plist" \
    -exportPath "${tempDir}"`;
    console.log(`Extracting .ipa: ${xcodeBuildCommand}`);
    execSync(xcodeBuildCommand);

    const finalBinaryDirectory = `"${this._repoDir}/internal_folder/react-native-wix-engine/app_builds/iphoneos/${buildType}"`;
    execSync(`mkdir -p ${finalBinaryDirectory}`);
    execSync(`cp -v "${tempDir}/${buildFlavor.scheme}.ipa" ${finalBinaryDirectory}/ReactNativeWixEngine.ipa`);
    execSync(`rm -rf ${tempDir}`);
    return `${finalBinaryDirectory}/ReactNativeWixEngine.ipa`;
  }

  setIosVersion(version, shortVersion) {
    process.chdir(`${__dirname}/../../../ios/`); // this is a bad practice - we should not change the engine; but it will probably change in the future anyway, so patching it this way for now
    execSync(`agvtool new-version -all ${version}`);
    execSync(`agvtool new-marketing-version ${shortVersion}`);
    process.chdir(`${__dirname}`);
  }

  _archivePath(scheme, version) {
    return `${this._xcodebuildTargetDir}/${scheme}_${version}.xcarchive`;
  }

  static _normalizeSpace(str) {
    if (!_.isString(str)) {
      return undefined;
    }
    return _.replace(_.trim(str), /\s+/g, '');
  }
}

module.exports = {
  IOSBuilder
};
