package com.example.grammarfix

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

data class ClaudeRequest(
    val model: String = "claude-haiku-4-5-20251001",
    @SerializedName("max_tokens") val maxTokens: Int = 1024,
    val messages: List<ClaudeMessage>
)

data class ClaudeMessage(
    val role: String,
    val content: String
)

data class ClaudeResponse(
    val content: List<ContentBlock>?,
    val error: ApiError?
)

data class ContentBlock(
    val type: String,
    val text: String?
)

data class ApiError(
    val type: String,
    val message: String
)

sealed class ApiResult {
    data class Success(val text: String) : ApiResult()
    data class Error(val message: String) : ApiResult()
}

class ClaudeApiService {

    private val gson = Gson()

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.NONE
        })
        .build()

    fun fixGrammar(apiKey: String, text: String): ApiResult {
        val prompt = """Fix the grammar, spelling, and punctuation in the following text.
Return ONLY the corrected text with no explanations, no quotes, and no commentary.

Text to fix:
$text"""

        val requestBody = ClaudeRequest(
            messages = listOf(ClaudeMessage(role = "user", content = prompt))
        )

        val json = gson.toJson(requestBody)
        val body = json.toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("https://api.anthropic.com/v1/messages")
            .addHeader("x-api-key", apiKey)
            .addHeader("anthropic-version", "2023-06-01")
            .addHeader("content-type", "application/json")
            .post(body)
            .build()

        return try {
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: return ApiResult.Error("Empty response")

            if (response.isSuccessful) {
                val parsed = gson.fromJson(responseBody, ClaudeResponse::class.java)
                val text = parsed.content?.firstOrNull { it.type == "text" }?.text
                if (text != null) ApiResult.Success(text.trim())
                else ApiResult.Error("No text in response")
            } else {
                val parsed = gson.fromJson(responseBody, ClaudeResponse::class.java)
                ApiResult.Error(parsed.error?.message ?: "HTTP ${response.code}")
            }
        } catch (e: Exception) {
            ApiResult.Error(e.message ?: "Network error")
        }
    }
}
