#!/usr/bin/env node
const {NativeBuilds} = require('../../tools/native_builds/index');
const BuildType = require('../../tools/native_builds/BuildType');

run().catch(error => {
  console.log(error);
  process.exit(1);
});

async function run() {
  NativeBuilds.buildAndroid(BuildType.dev);

  // Todo:: implement next line to build release for real devices
  // NativeBuilds.buildAndroid(BuildType.release);
}
