import {forEach, startsWith, has} from 'lodash';
import {getServiceConsumers} from './ModuleUtils';

export class ModuleInitializer {
  constructor({
    sendBroadcast,
    registerMethod,
    registerComponent,
    registerListener,
    removeListener,
    registerConsumedServices,
    modulesConfig,
  }) {
    this.sendBroadcast = sendBroadcast;
    this.registerMethod = registerMethod;
    this.registerComponent = registerComponent;
    this.registerListener = registerListener;
    this.removeListener = removeListener;
    this.registerConsumedServices = registerConsumedServices;
    this.modulesConfig = modulesConfig || {};
    this.consumedServices = {};
  }

  /**
   * sets the modules and their order of initialization
   * and resolves ConsumersToProviders from the modules
   * @param modules
   * @param modulesOrder
   */
  modulesCreated(modules, modulesOrder) {
    this.modules = modules;
    this.modulesOrder = modulesOrder;
    this.consumedServices = this._initConsumedServices();
    this.registerConsumedServices(this.consumedServices);
  }

  init() {
    forEach(this.modulesOrder, moduleName => {
      try {
        //for now if a modules fails it will be ignored
        const module = this.modules[moduleName];
        if (module.init) {
          module.init(this.modulesConfig[moduleName]);
        }
        this._initModuleProviders(module, moduleName);

        if (module.components) {
          forEach(
            module.components(),
            this._getComponentRegistratorForModule(moduleName, module),
          );
        }

        if (module.methods) {
          forEach(
            module.methods(),
            this._getMethodRegistratorForModule(moduleName, module),
          );
        }

        if (module.listeners) {
          const remover = id => {
            this.removeListener(id, module.prefix());
          };
          forEach(
            module.listeners(remover),
            this._getListenerRegistratorForModule(module.prefix(), remover),
          );
        }

        if (module.registerBroadcasts) {
          module.registerBroadcasts(id => {
            this._checkValidPrefixForId(moduleName, module, id);
            return (...params) => this.sendBroadcast(id, ...params);
          });
        }
      } catch (e) {
        console.error('ERROR INITIALIZING MODULE', moduleName, e.message);
      }
    });
  }

  // builds serviceName -> {module, generator, value} map
  _initConsumedServices() {
    const map = {};
    forEach(Object.values(this.modules), module => {
      if (module.consumedServices) {
        const consumedServices = module.consumedServices();
        this._initModuleConsumedServices({
          module,
          servicesObject: consumedServices,
          valueType: 'object',
          map,
        });
      } else if (module.consumedServicesFunctions) {
        const consumedServicesFunctions = module.consumedServicesFunctions();
        this._initModuleConsumedServices({
          module,
          servicesObject: consumedServicesFunctions,
          valueType: 'generator',
          map,
        });
      }
    });
    return map;
  }

  // valueType should be 'object' or 'generator'
  _initModuleConsumedServices({module, servicesObject, valueType, map}) {
    if (servicesObject) {
      for (const serviceName in servicesObject) {
        if (has(servicesObject, serviceName)) {
          if (!map[serviceName]) {
            map[serviceName] = [];
          }
          let generator;
          let value;
          if (valueType === 'generator') {
            generator = servicesObject[serviceName];
          } else {
            value = servicesObject[serviceName];
          }
          map[serviceName].push({module, generator, value});
        }
      }
    }
  }

  _initModuleProviders(module, moduleName) {
    if (module.providedServices) {
      try {
        const providers = module.providedServices();
        forEach(Object.keys(providers), providerName => {
          this._checkValidPrefixForId(moduleName, module, providerName);
          providers[providerName](
            getServiceConsumers(this.consumedServices, providerName),
          );
        });
      } catch (error) {
        if (__DEV__) {
          throw error;
        } else {
          //FATAL should not happen in production
          console.error(
            `FATAL ERROR, cannot init module ${module.prefix()} providers`,
            error,
          );
        }
      }
    }
  }

  _getComponentRegistratorForModule(moduleName, module) {
    return ({id, generator, store, provider, description}) => {
      this._checkValidPrefixForId(moduleName, module, id);
      return this.registerComponent(id, generator, store, provider);
    };
  }

  _getMethodRegistratorForModule(moduleName, module) {
    return ({id, generator, description}) => {
      this._checkValidPrefixForId(moduleName, module, id);
      this.registerMethod(id, generator);
    };
  }

  _getListenerRegistratorForModule(prefix) {
    return ({id, callback}) => {
      this.registerListener(id, prefix, callback);
    };
  }

  _checkValidPrefixForId(moduleName, module, id) {
    if (__DEV__) {
      if (!startsWith(id, module.prefix())) {
        console.error(
          `Module: ${moduleName} registers Id: ${id} with wrong prefix. (expected prefix: '${module.prefix()}')`,
        );
      }
    }
  }
}
