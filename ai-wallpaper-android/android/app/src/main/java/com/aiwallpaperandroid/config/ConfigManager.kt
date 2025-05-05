package com.aiwallpaperandroid.config

import android.content.Context
import android.content.SharedPreferences

/**
 * Manages configuration for the AI Wallpaper app
 */
class ConfigManager(context: Context) {
    companion object {
        private const val PREFS_NAME = "AIWallpaperConfig"
        private const val KEY_OPENAI_API_KEY = "openai_api_key"
        private const val DEFAULT_PROMPT = "Generate a colorful wallpaper featuring a photorealistic character designed with a style inspired by anime. The character is a young girl with large, expressive eyes and long hair styled in soft waves. She is dressed in a cute dress and her pose is random. The girl's layer is small and features her entire body, placed on a colorful background."
    }

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    /**
     * Get the stored OpenAI API key
     */
    fun getApiKey(): String {
        return prefs.getString(KEY_OPENAI_API_KEY, "") ?: ""
    }

    /**
     * Store a new OpenAI API key
     */
    fun setApiKey(apiKey: String) {
        prefs.edit().putString(KEY_OPENAI_API_KEY, apiKey).apply()
    }

    /**
     * Get the default prompt for wallpaper generation
     * In a full implementation, this could be customizable by the user
     */
    fun getDefaultPrompt(): String {
        return DEFAULT_PROMPT
    }
}