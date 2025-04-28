package com.aiwallpaperandroid

import android.content.Context
import android.util.Log
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.aiwallpaperandroid.workers.WallpaperWorker
import java.util.concurrent.TimeUnit

/**
 * Helper class for scheduling wallpaper generation on a daily basis
 */
class WallpaperScheduler(private val context: Context) {

    companion object {
        private const val TAG = "WallpaperScheduler"
        private const val WALLPAPER_WORK_NAME = "ai_wallpaper_daily_generator"
    }

    /**
     * Schedule the daily wallpaper generation task
     * @return true if scheduling was successful
     */
    fun scheduleDailyWallpaper(): Boolean {
        try {
            Log.d(TAG, "Scheduling daily wallpaper generation")
            
            // Define work constraints - we need internet to fetch AI-generated images
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .setRequiresCharging(false)
                .build()
            
            // Create a periodic work request that runs once per day
            val dailyWallpaperRequest = PeriodicWorkRequestBuilder<WallpaperWorker>(
                24, TimeUnit.HOURS
            )
                .setConstraints(constraints)
                .build()
            
            // Enqueue the work with WorkManager, replacing any existing work
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WALLPAPER_WORK_NAME,
                ExistingPeriodicWorkPolicy.UPDATE,
                dailyWallpaperRequest
            )
            
            Log.d(TAG, "Daily wallpaper generation scheduled successfully")
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to schedule daily wallpaper generation", e)
            return false
        }
    }
    
    /**
     * Cancel the scheduled daily wallpaper generation
     * @return true if cancellation was successful
     */
    fun cancelDailyWallpaper(): Boolean {
        try {
            Log.d(TAG, "Cancelling daily wallpaper generation")
            
            WorkManager.getInstance(context).cancelUniqueWork(WALLPAPER_WORK_NAME)
            
            Log.d(TAG, "Daily wallpaper generation cancelled successfully")
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to cancel daily wallpaper generation", e)
            return false
        }
    }
    
    /**
     * Generate a wallpaper immediately
     * @return true if the work was successfully enqueued
     */
    fun generateWallpaperNow(): Boolean {
        try {
            Log.d(TAG, "Generating wallpaper now")
            
            // Create a one-time work request
            val oneTimeWallpaperRequest = OneTimeWorkRequestBuilder<WallpaperWorker>()
                .build()
            
            // Enqueue the work with WorkManager
            WorkManager.getInstance(context).enqueue(oneTimeWallpaperRequest)
            
            Log.d(TAG, "One-time wallpaper generation scheduled successfully")
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to generate wallpaper now", e)
            return false
        }
    }
    
    /**
     * Check if daily wallpaper generation is scheduled
     * @return true if daily wallpaper generation is active
     */
    fun isDailyWallpaperScheduled(): Boolean {
        val workInfos = WorkManager.getInstance(context)
            .getWorkInfosForUniqueWork(WALLPAPER_WORK_NAME)
            .get()
        
        return workInfos.isNotEmpty() && workInfos.any { !it.state.isFinished }
    }
}