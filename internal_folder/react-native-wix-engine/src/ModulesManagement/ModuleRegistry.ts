import _ from 'lodash';
// @ts-ignore
import {ComponentType} from 'react';
import {Navigation} from 'react-native-navigation';
import {getServiceConsumers, ConsumedServices} from './ModuleUtils';

type GlobalID = string;
type ComponentGenerator = () => ComponentType<any>;
type MethodGenerator = () => Function;

class ModuleRegistry {
  private registeredComponents: {[key: string]: ComponentGenerator};
  private registeredMethods: {[key: string]: MethodGenerator};
  private eventListeners: {[key: string]: {[key: string]: Function}};
  private consumedServices: ConsumedServices;

  constructor() {
    this.registeredComponents = {};
    this.registeredMethods = {};
    this.eventListeners = {};
    this.consumedServices = {};

    this.addListener = this.addListener.bind(this);
    this.hasMethod = this.hasMethod.bind(this);
    this.__notifyListeners = this.__notifyListeners.bind(this);
    this.__registerMethod = this.__registerMethod.bind(this);
    this.__registerComponentAsScreen = this.__registerComponentAsScreen.bind(this);
    this.__registerListener = this.__registerListener.bind(this);
    this.__removeListener = this.__removeListener.bind(this);
    this.__registerConsumedServices = this.__registerConsumedServices.bind(this);
    this.invoke = this.invoke.bind(this);
    this.getServiceConsumers = this.getServiceConsumers.bind(this);

    Navigation.setLazyComponentRegistrator((name) => {
      if (this.registeredComponents[name]) {
        Navigation.registerComponent(name, this.registeredComponents[name]);
      }
    });
  }

  component(globalID: GlobalID) {
    const generator = this.registeredComponents[globalID];
    if (!generator) {
      console.error(`ModuleRegistry.component ${globalID} used but not yet registered`);
      return undefined;
    }
    return generator();
  }

  hasComponent(globalID: GlobalID) {
    return !!this.registeredComponents[globalID];
  }

  addListener(globalID: GlobalID, callback: Function) {
    const callbackKey = _.uniqueId('eventListener');
    _.set(this.eventListeners, [globalID, callbackKey], callback);
    return {
      remove: () => _.unset(this.eventListeners[globalID], callbackKey)
    };
  }

  getServiceConsumers(serviceName: string) {
    return getServiceConsumers(this.consumedServices, serviceName);
  }

  hasMethod(globalID: GlobalID) {
    return !!this.registeredMethods[globalID];
  }

  invoke(globalID: GlobalID, ...args: any[]) {
    const generator = this.registeredMethods[globalID];
    if (!generator) {
      console.error(`ModuleRegistry.invoke ${globalID} used but not yet registered`);
      return undefined;
    }
    const method = generator();
    return method(...args);
  }

  __notifyListeners(globalID: GlobalID, ...args: any[]) {
    const listenerCallbacks = this.eventListeners[globalID];
    if (!listenerCallbacks) {
      return;
    }
    _.forEach(listenerCallbacks, (callback) => invokeSafely(callback, args));
  }

  __registerMethod = (globalID: GlobalID, generator: MethodGenerator) => {
    if (this.hasMethod(globalID)) {
      console.error(`Method Id: ${globalID} already registered`);
      return;
    }
    this.registeredMethods[globalID] = generator;
  };

  __registerListener(globalID: GlobalID, listenerModulePrefix: string, callback: Function) {
    _.set(this.eventListeners, [globalID, listenerModulePrefix], callback);
  }

  __removeListener(globalID: GlobalID, listenerModulePrefix: string) {
    _.unset(this.eventListeners[globalID], listenerModulePrefix);
  }

  __registerConsumedServices(consumedServices: ConsumedServices) {
    this.consumedServices = consumedServices;
  }

  __registerComponentAsScreen = (globalID: GlobalID, generator: ComponentGenerator) => {
    if (this.registeredComponents[globalID]) {
      console.error(`Component Id: ${globalID} already registered`);
      return;
    }

    this.registeredComponents[globalID] = generator;
  };
}

export default new ModuleRegistry();

function invokeSafely(callback: Function, args: any[]) {
  try {
    callback(...args);
  } catch (err) {
    console.error(err);
  }
}
