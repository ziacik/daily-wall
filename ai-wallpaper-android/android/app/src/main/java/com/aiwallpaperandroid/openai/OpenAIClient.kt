package com.aiwallpaperandroid.openai

import android.util.Log
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Client implementation for OpenAI API
 */
class OpenAIClient {
    companion object {
        private const val TAG = "OpenAIClient"
        private const val BASE_URL = "https://api.openai.com/v1/"
    }

    private val apiService: OpenAIService
    private var apiKey: String = ""

    init {
        val loggingInterceptor = HttpLoggingInterceptor().apply { 
            level = HttpLoggingInterceptor.Level.BASIC 
        }
        
        val httpClient = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS) // DALL-E 3 can take time
            .build()
            
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            
        apiService = retrofit.create(OpenAIService::class.java)
    }

    fun setApiKey(key: String) {
        apiKey = key
    }

    /**
     * Generate an image using DALL-E 3, similar to the Node.js implementation
     * @return URL of the generated image, or null if generation failed
     */
    fun generateImage(prompt: String): String? {
        if (apiKey.isEmpty()) {
            Log.e(TAG, "API key not set")
            return null
        }

        val request = ImageGenerationRequest(
            model = "dall-e-3",
            prompt = prompt,
            size = "1024x1024"
        )

        try {
            val authHeader = "Bearer $apiKey"
            val response = apiService.generateImage(authHeader, request).execute()
            
            if (response.isSuccessful) {
                val body = response.body()
                if (!body?.data.isNullOrEmpty() && body?.data?.get(0)?.url != null) {
                    return body.data[0].url
                } else {
                    Log.e(TAG, "Empty response data")
                }
            } else {
                Log.e(TAG, "Failed to generate image: ${response.errorBody()?.string()}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception generating image", e)
        }
        
        return null
    }
}