# react-native-wix-engine

This project is a partially implementation of Wix Multi-Module architecture for react-native application, you can read more here:
https://medium.com/@omribruchim/react-native-at-wix-the-architecture-db6361764da6

<p align="center">
    <img src="https://cdn-images-1.medium.com/max/1600/1*0uOMzP8Kcc6RLrcu8MdYGg.png"/>
</p>


## Installation

* Make sure you have all [requirements](https://facebook.github.io/react-native/docs/getting-started.html#requirements) for running React Native projects
* Make sure you're using a Mac and have Xcode installed
* Make sure your brew is upgraded (`brew upgrade`)
* Make sure you have node 10+ (`node -v`), use `nvm` to manage multiple nodes (`nvm ls`, `nvm install 10`)
* From within your project folder run `npm install`

## Running The Project

* `npm run build`: build the project
* `npm run build-android`: build only Android project
* `npm run build-ios`: build only iOS project
* `npm run build-ts`: build build ts files
* `npm run ios`: runs the Engine with demo modules on all opened iOS Simulator 
* `npm run android`: runs the Engine demo modules on all opened Android emulator
* `npm run start-empty-engine`: runs the Engine on all opened Android emulator and iOS simulators 
