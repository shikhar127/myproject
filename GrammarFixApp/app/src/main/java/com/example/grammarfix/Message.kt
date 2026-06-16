package com.example.grammarfix

data class Message(
    val text: String,
    val type: MessageType
)

enum class MessageType {
    ORIGINAL,
    FIXED,
    ERROR,
    LOADING
}
