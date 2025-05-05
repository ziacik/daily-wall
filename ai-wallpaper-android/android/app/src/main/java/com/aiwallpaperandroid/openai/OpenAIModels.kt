package com.aiwallpaperandroid.openai

import com.google.gson.annotations.SerializedName

/**
 * Request body for generating images with OpenAI
 */
data class ImageGenerationRequest(
    val model: String,
    val prompt: String,
    val size: String,
    @SerializedName("n") val numberOfImages: Int = 1
)

/**
 * Response from OpenAI image generation API
 */
data class ImageGenerationResponse(
    val created: Long,
    val data: List<ImageData>
)

/**
 * Individual image data containing URL or base64 data
 */
data class ImageData(
    val url: String?,
    @SerializedName("b64_json") val base64Json: String?
)