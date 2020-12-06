#!/usr/bin/env node
const {NativeBuilds} = require('../../tools/native_builds/index');
const BuildType = require('../../tools/native_builds/BuildType');
const {simulator, iphone} = require('../../tools/native_builds/BuildPlatforms.json');
const exec = require('../utils/exec');

run().catch(error => {
  console.log(error);
  process.exit(1);
});

async function run() {
  installPods();

  NativeBuilds.buildIOS(simulator, BuildType.dev);
  // you can add how many build flavors you want

  // Todo:: implement next line to build also for real devices in addition to simulator build
  //NativeBuilds.buildIOS(iphone, BuildType.dev);

  // Todo:: implement next line to build release for real devices
  //NativeBuilds.buildIOS(iphone, BuildType.release);
}

function installPods() {
  console.log('\n*** Installing Pods ***');
  exec.execSync(`cd ${__dirname}/../../ios && pod install`);
}
