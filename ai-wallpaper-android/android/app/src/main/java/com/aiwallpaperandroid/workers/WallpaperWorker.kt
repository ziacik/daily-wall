package com.aiwallpaperandroid.workers

import android.app.WallpaperManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.aiwallpaperandroid.config.ConfigManager
import com.aiwallpaperandroid.openai.OpenAIClient
import com.bumptech.glide.Glide
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.Random
import java.util.concurrent.TimeUnit

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
        private const val MAX_RETRIES = 3
        private const val RETRY_DELAY_MS = 60000L // 1 minute
    }

    private val openAIClient = OpenAIClient()
    private val configManager = ConfigManager(context)

    override fun doWork(): Result {
        try {
            Log.d(TAG, "Starting wallpaper generation process")
            
            // Get API key from config
            val apiKey = configManager.getApiKey()
            if (apiKey.isEmpty()) {
                Log.e(TAG, "OpenAI API key not configured")
                return Result.failure()
            }
            
            openAIClient.setApiKey(apiKey)
            
            // Get the prompt for image generation
            val prompt = configManager.getDefaultPrompt()
            
            // Generate an AI image with retry logic
            val imageUrl = retryGenerateImage(prompt)
            
            if (imageUrl != null) {
                Log.d(TAG, "Successfully generated image URL: $imageUrl")
                
                // Download and save the image
                val bitmap = downloadImage(imageUrl)
                if (bitmap != null) {
                    // Save the bitmap to a file with a date-based name
                    val wallpaperFile = saveWallpaperToFile(bitmap)
                    
                    // Set as wallpaper
                    setWallpaper(bitmap)
                    
                    Log.d(TAG, "Wallpaper successfully generated and applied")
                    return Result.success()
                } else {
                    Log.e(TAG, "Failed to download image")
                }
            } else {
                Log.e(TAG, "Failed to generate image URL after retries")
            }
            
            // If we reach here, something went wrong but we can use the fallback gradient
            Log.d(TAG, "Using fallback gradient wallpaper")
            val fallbackBitmap = generateGradientImage()
            saveWallpaperToFile(fallbackBitmap)
            setWallpaper(fallbackBitmap)
            
            // Return success even with the fallback, so the work doesn't get rescheduled repeatedly
            return Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error generating wallpaper", e)
            return Result.failure()
        }
    }
    
    /**
     * Retry image generation with exponential backoff
     */
    private fun retryGenerateImage(prompt: String): String? {
        var lastError: Exception? = null
        
        for (attempt in 1..MAX_RETRIES) {
            try {
                val imageUrl = openAIClient.generateImage(prompt)
                if (imageUrl != null) {
                    return imageUrl
                }
            } catch (e: Exception) {
                Log.w(TAG, "Attempt $attempt failed with error: ${e.message}")
                lastError = e
                
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_DELAY_MS)
                    } catch (ie: InterruptedException) {
                        Thread.currentThread().interrupt()
                        break
                    }
                }
            }
        }
        
        Log.e(TAG, "All attempts failed", lastError)
        return null
    }
    
    /**
     * Download an image from URL using Glide
     */
    private fun downloadImage(imageUrl: String): Bitmap? {
        try {
            // Use Glide to handle image download and processing
            return Glide.with(context)
                .asBitmap()
                .load(imageUrl)
                .submit()
                .get(60, TimeUnit.SECONDS)
        } catch (e: Exception) {
            Log.e(TAG, "Error downloading image", e)
            return null
        }
    }
    
    /**
     * Generate a gradient wallpaper as a fallback
     */
    private fun generateGradientImage(): Bitmap {
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
        // Create a filename with the current date
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val currentDate = dateFormat.format(Date())
        val filename = "ai-wallpaper-$currentDate.jpg"
        val wallpaperFile = File(context.filesDir, filename)
        
        // Also save a copy as the current wallpaper
        val currentWallpaperFile = File(context.filesDir, "current_wallpaper.jpg")
        
        try {
            // Save the dated version
            FileOutputStream(wallpaperFile).use { out ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 95, out)
                out.flush()
            }
            
            // Save as current wallpaper
            FileOutputStream(currentWallpaperFile).use { out ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 95, out)
                out.flush()
            }
        } catch (e: IOException) {
            Log.e(TAG, "Failed to save wallpaper to file", e)
        }
        
        return wallpaperFile
    }
    
    /**
     * Set the bitmap as the device wallpaper
     */
    private fun setWallpaper(bitmap: Bitmap) {
        try {
            val wallpaperManager = WallpaperManager.getInstance(context)
            wallpaperManager.setBitmap(bitmap)
            Log.d(TAG, "Wallpaper set successfully")
        } catch (e: IOException) {
            Log.e(TAG, "Failed to set wallpaper", e)
        }
    }
}