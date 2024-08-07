package com.reactnativewixengine

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactHost
import com.reactnativenavigation.NavigationApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.reactnativenavigation.react.NavigationReactNativeHost
import com.facebook.soloader.SoLoader
import java.util.List

class MainApplication : NavigationApplication() {
  override val reactNativeHost: ReactNativeHost =
      object : NavigationReactNativeHost(this) {
          override fun getPackages(): MutableList<ReactPackage> = PackageList(this).packages.apply {
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // add(MyReactNativePackage())
          }

          override fun getJSMainModuleName(): String = "engine_autogenerated/index"
 
          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
          override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }
 
  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)
 
  override fun onCreate() {
    super.onCreate()
//    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
//      load()
//    }
  }
}