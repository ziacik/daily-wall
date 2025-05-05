package com.aiwallpaperandroid.openai

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

/**
 * Retrofit interface for OpenAI API communication
 */
interface OpenAIService {
    @POST("images/generations")
    fun generateImage(
        @Header("Authorization") authorization: String,
        @Body request: ImageGenerationRequest
    ): Call<ImageGenerationResponse>
}