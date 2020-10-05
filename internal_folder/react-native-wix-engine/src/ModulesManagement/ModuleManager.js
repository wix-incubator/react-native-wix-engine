import _ from 'lodash';
import autoBind from 'react-autobind';

export const REQUIRED_FUNCTIONS = ['prefix'];

export class ModuleManager {
  constructor({engineConfig, moduleGenerators, moduleInitializer}) {
    autoBind(this);
    this.navigator = navigator;
    this.moduleInitializer = moduleInitializer;
    this.modules = {};
    this.config = _.merge({modules: []}, engineConfig);
    this._createModules(moduleGenerators);
    this.moduleInitializer.modulesCreated(this.modules, this.config.modules);
    this._validate();
  }

  _validate() {
    this._forEachModule(({moduleName}) => this._validateModule(moduleName));
  }

  initModules() {
    this.moduleInitializer.init();
  }

  getTabs() {
    return this._getAllTabs();
  }

  getLinkDefinitions() {
    const linkDefs = [];
    this._forEachModule(({module, moduleName}) => {
      if (module.deepLinks) {
        const deepLinks = module.deepLinks();
        if (deepLinks) {
          linkDefs.push(...this._mapDeepLinks(moduleName, deepLinks));
        }
      }
    });
    return linkDefs;
  }

  onLogin() {
    this._forEachModule(({module, moduleName}) => {
      if (!module.onLogin) {
        return;
      }
      try {
        module.onLogin();
      } catch (e) {
        console.error(`Module ${moduleName} threw error in onLogin`, e);
      }
    });
  }

  onLogout() {
    this._forEachModule(({module, moduleName}) => {
      if (!module.onLogout) {
        return;
      }
      try {
        module.onLogout();
      } catch (e) {
        console.error(`Module ${moduleName} threw error in onLogout`, e);
      }
    });
  }

  onAppSwitchToBackground() {
    this._forEachModule(({module, moduleName}) => {
      if (!module.onAppSwitchToBackground) {
        return;
      }
      try {
        module.onAppSwitchToBackground();
      } catch (e) {
        console.error(
          `Module ${moduleName} threw error in onAppSwitchToBackground`,
          e,
        );
      }
    });
  }

  onAppSwitchToForeground() {
    this._forEachModule(({module, moduleName}) => {
      if (!module.onAppSwitchToForeground) {
        return;
      }
      try {
        module.onAppSwitchToForeground();
      } catch (e) {
        console.error(
          `Module ${moduleName} threw error in onAppSwitchToForeground`,
          e,
        );
      }
    });
  }

  _getAllTabs() {
    const allTabs = [];
    this._forEachModule(({module}) => {
      if (module.tabs) {
        allTabs.push(...module.tabs());
      }
    });
    return allTabs;
  }

  _createModules(moduleGenerators) {
    _.forEach(this.config.modules, moduleName => {
      try {
        if (!this.modules[moduleName] && moduleGenerators[moduleName]) {
          this.modules[moduleName] = new (moduleGenerators[moduleName]())();
        }
      } catch (e) {
        throw new Error('Error constructing module ' + moduleName, e);
      }
    });
  }

  _forEachModule(fn, shouldBreak = () => false) {
    _.forEach(this.modules, (module, moduleName) => {
      fn({moduleName, module});
      if (shouldBreak && shouldBreak()) {
        return false;
      }
    });
  }

  _validateModule(moduleName) {
    _.forEach(REQUIRED_FUNCTIONS, fn => this._assertFunction(moduleName, fn));
    this._assertPrefixIsStringAndUnique(moduleName);
  }

  _assertFunction(moduleName, functionName) {
    const module = this.modules[moduleName];
    if (!module[functionName] || typeof module[functionName] !== 'function') {
      const msg = moduleName + ' is missing ' + functionName + ' function';
      console.error(msg);
      throw new Error(msg);
    }
  }

  _assertPrefixIsStringAndUnique(moduleNameToAssert) {
    const prefix = this.modules[moduleNameToAssert].prefix();
    if (!_.isString(prefix)) {
      throw new Error(moduleNameToAssert + ' does not return a valid prefix');
    }

    this._forEachModule(({moduleName, module}) => {
      if (
        module.prefix &&
        module.prefix() === prefix &&
        moduleNameToAssert !== moduleName
      ) {
        console.error(
          `Modules's prefix: ${prefix} used by 2 modules: ${moduleNameToAssert} , ${moduleName}`,
        );
      }
    });
  }

  _mapDeepLinks(moduleName, deepLinks) {
    return deepLinks.map(l => ({...l, moduleName}));
  }
}
