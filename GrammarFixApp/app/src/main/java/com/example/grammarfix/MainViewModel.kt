package com.example.grammarfix

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

sealed class UiEvent {
    data class AddMessage(val message: Message) : UiEvent()
    data class ReplaceLastMessage(val message: Message) : UiEvent()
    object ClearMessages : UiEvent()
    object ScrollToBottom : UiEvent()
}

class MainViewModel : ViewModel() {

    private val apiService = ClaudeApiService()

    private val _events = MutableSharedFlow<UiEvent>(extraBufferCapacity = 8)
    val events = _events.asSharedFlow()

    fun fixGrammar(apiKey: String, inputText: String) {
        if (inputText.isBlank()) return

        viewModelScope.launch {
            _events.emit(UiEvent.AddMessage(Message(inputText, MessageType.ORIGINAL)))
            _events.emit(UiEvent.AddMessage(Message("Correcting grammar…", MessageType.LOADING)))
            _events.emit(UiEvent.ScrollToBottom)

            val result = withContext(Dispatchers.IO) {
                apiService.fixGrammar(apiKey, inputText)
            }

            when (result) {
                is ApiResult.Success ->
                    _events.emit(UiEvent.ReplaceLastMessage(Message(result.text, MessageType.FIXED)))
                is ApiResult.Error ->
                    _events.emit(UiEvent.ReplaceLastMessage(Message("Error: ${result.message}", MessageType.ERROR)))
            }
            _events.emit(UiEvent.ScrollToBottom)
        }
    }

    fun clearMessages() {
        viewModelScope.launch { _events.emit(UiEvent.ClearMessages) }
    }
}
