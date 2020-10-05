import moduleRegistry from './ModuleRegistry';

module.exports = {
  moduleRegistry,
  sendBroadcast: moduleRegistry.__notifyListeners,
  registerMethod: moduleRegistry.__registerMethod,
  registerComponent: moduleRegistry.__registerComponentAsScreen,
  registerListener: moduleRegistry.__registerListener,
  removeListener: moduleRegistry.__removeListener,
  registerConsumedServices: moduleRegistry.__registerConsumedServices,
  invoke: moduleRegistry.invoke,
  hasMethod: moduleRegistry.hasMethod,
  addListener: moduleRegistry.addListener,
};
