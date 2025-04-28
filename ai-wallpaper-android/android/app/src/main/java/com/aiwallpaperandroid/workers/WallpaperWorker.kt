package com.aiwallpaperandroid.workers

import android.app.WallpaperManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters
import java.io.File
import java.io.FileOutputStream
import java.util.Random

/**
 * Worker class that handles generating and setting AI wallpapers
 * on a daily schedule.
 */
class WallpaperWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : Worker(context, workerParams) {

    companion object {
        private const val TAG = "WallpaperWorker"
        private const val WALLPAPER_WIDTH = 1080
        private const val WALLPAPER_HEIGHT = 1920
    }

    override fun doWork(): Result {
        try {
            Log.d(TAG, "Starting wallpaper generation process")
            
            // In a real implementation, this would call your AI service to generate an image
            // For now, we'll create a simple gradient wallpaper as a placeholder
            val bitmap = generatePlaceholderImage()
            
            // Save the bitmap to a file
            val wallpaperFile = saveWallpaperToFile(bitmap)
            
            // Set as wallpaper
            setWallpaper(bitmap)
            
            Log.d(TAG, "Wallpaper successfully generated and applied")
            return Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error generating wallpaper", e)
            return Result.failure()
        }
    }
    
    /**
     * Generate a simple gradient wallpaper as a placeholder
     * In a real implementation, this would call your AI service API
     */
    private fun generatePlaceholderImage(): Bitmap {
        val bitmap = Bitmap.createBitmap(WALLPAPER_WIDTH, WALLPAPER_HEIGHT, Bitmap.Config.ARGB_8888)
        val random = Random()
        
        // Create a random gradient
        val startColor = Color.rgb(random.nextInt(256), random.nextInt(256), random.nextInt(256))
        val endColor = Color.rgb(random.nextInt(256), random.nextInt(256), random.nextInt(256))
        
        for (y in 0 until WALLPAPER_HEIGHT) {
            val ratio = y.toFloat() / WALLPAPER_HEIGHT
            
            val r = interpolateColor(Color.red(startColor), Color.red(endColor), ratio)
            val g = interpolateColor(Color.green(startColor), Color.green(endColor), ratio)
            val b = interpolateColor(Color.blue(startColor), Color.blue(endColor), ratio)
            
            val rowColor = Color.rgb(r, g, b)
            
            for (x in 0 until WALLPAPER_WIDTH) {
                bitmap.setPixel(x, y, rowColor)
            }
        }
        
        return bitmap
    }
    
    /**
     * Interpolate between two color values based on ratio
     */
    private fun interpolateColor(start: Int, end: Int, ratio: Float): Int {
        return (start + (end - start) * ratio).toInt()
    }
    
    /**
     * Save wallpaper to a file in the app's files directory
     */
    private fun saveWallpaperToFile(bitmap: Bitmap): File {
        val wallpaperFile = File(context.filesDir, "current_wallpaper.jpg")
        
        FileOutputStream(wallpaperFile).use { out ->
            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)
            out.flush()
        }
        
        return wallpaperFile
    }
    
    /**
     * Set the bitmap as the device wallpaper
     */
    private fun setWallpaper(bitmap: Bitmap) {
        val wallpaperManager = WallpaperManager.getInstance(context)
        wallpaperManager.setBitmap(bitmap)
    }
}