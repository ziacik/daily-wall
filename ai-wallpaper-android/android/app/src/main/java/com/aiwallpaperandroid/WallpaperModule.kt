package com.aiwallpaperandroid

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * React Native module that exposes wallpaper generation functionality to JavaScript
 */
class WallpaperModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val wallpaperScheduler = WallpaperScheduler(reactContext)
    
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
}