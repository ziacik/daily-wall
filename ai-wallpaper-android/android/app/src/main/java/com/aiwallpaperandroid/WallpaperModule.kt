package com.aiwallpaperandroid

import android.util.Log
import com.aiwallpaperandroid.config.ConfigManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

/**
 * React Native module that exposes wallpaper generation functionality to JavaScript
 */
class WallpaperModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val wallpaperScheduler = WallpaperScheduler(reactContext)
    private val configManager = ConfigManager(reactContext)
    
    companion object {
        private const val TAG = "WallpaperModule"
    }

    override fun getName(): String = "WallpaperModule"
    
    /**
     * Generate a new wallpaper immediately
     */
    @ReactMethod
    fun generateWallpaper(promise: Promise) {
        try {
            val result = wallpaperScheduler.generateWallpaperNow()
            if (result) {
                promise.resolve(true)
            } else {
                promise.reject("ERROR_GENERATING", "Failed to generate wallpaper")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error generating wallpaper", e)
            promise.reject("ERROR_GENERATING", e.message, e)
        }
    }
    
    /**
     * Schedule daily wallpaper generation
     */
    @ReactMethod
    fun scheduleDailyWallpaper(promise: Promise) {
        try {
            val result = wallpaperScheduler.scheduleDailyWallpaper()
            if (result) {
                promise.resolve(true)
            } else {
                promise.reject("ERROR_SCHEDULING", "Failed to schedule daily wallpaper")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error scheduling daily wallpaper", e)
            promise.reject("ERROR_SCHEDULING", e.message, e)
        }
    }
    
    /**
     * Cancel daily wallpaper generation
     */
    @ReactMethod
    fun cancelDailyWallpaper(promise: Promise) {
        try {
            val result = wallpaperScheduler.cancelDailyWallpaper()
            if (result) {
                promise.resolve(true)
            } else {
                promise.reject("ERROR_CANCELLING", "Failed to cancel daily wallpaper")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error cancelling daily wallpaper", e)
            promise.reject("ERROR_CANCELLING", e.message, e)
        }
    }
    
    /**
     * Check if daily wallpaper generation is scheduled
     */
    @ReactMethod
    fun isDailyWallpaperScheduled(promise: Promise) {
        try {
            val isScheduled = wallpaperScheduler.isDailyWallpaperScheduled()
            promise.resolve(isScheduled)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if daily wallpaper is scheduled", e)
            promise.reject("ERROR_CHECKING", e.message, e)
        }
    }
    
    /**
     * Save OpenAI API key
     */
    @ReactMethod
    fun setApiKey(apiKey: String, promise: Promise) {
        try {
            configManager.setApiKey(apiKey)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error setting API key", e)
            promise.reject("ERROR_SETTING_API_KEY", e.message, e)
        }
    }
    
    /**
     * Get OpenAI API key (may be empty if not set)
     */
    @ReactMethod
    fun getApiKey(promise: Promise) {
        try {
            val apiKey = configManager.getApiKey()
            promise.resolve(apiKey)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting API key", e)
            promise.reject("ERROR_GETTING_API_KEY", e.message, e)
        }
    }
    
    /**
     * Check if API key is configured
     */
    @ReactMethod
    fun isApiKeyConfigured(promise: Promise) {
        try {
            val apiKey = configManager.getApiKey()
            promise.resolve(apiKey.isNotEmpty())
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if API key is configured", e)
            promise.reject("ERROR_CHECKING_API_KEY", e.message, e)
        }
    }
    
    /**
     * Get the path to the current wallpaper image file
     */
    @ReactMethod
    fun getCurrentWallpaperPath(promise: Promise) {
        try {
            val currentWallpaperFile = File(reactApplicationContext.filesDir, "current_wallpaper.jpg")
            
            if (currentWallpaperFile.exists()) {
                // Return the file URI that can be used by React Native Image component
                val fileUri = "file://${currentWallpaperFile.absolutePath}"
                promise.resolve(fileUri)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting current wallpaper path", e)
            promise.reject("ERROR_GETTING_PATH", e.message, e)
        }
    }
    
    /**
     * Check if a wallpaper image exists
     */
    @ReactMethod
    fun hasCurrentWallpaper(promise: Promise) {
        try {
            val currentWallpaperFile = File(reactApplicationContext.filesDir, "current_wallpaper.jpg")
            promise.resolve(currentWallpaperFile.exists())
        } catch (e: Exception) {
            Log.e(TAG, "Error checking if wallpaper exists", e)
            promise.reject("ERROR_CHECKING_WALLPAPER", e.message, e)
        }
    }
}