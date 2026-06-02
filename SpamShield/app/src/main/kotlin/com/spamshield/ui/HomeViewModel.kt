package com.spamshield.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.spamshield.data.SpamRepository
import com.spamshield.data.entity.CallAction
import com.spamshield.data.entity.ListType
import com.spamshield.data.entity.NumberListEntry
import com.spamshield.data.entity.SettingsEntity
import com.spamshield.data.entity.SpamLogEntry
import com.spamshield.data.entity.StatsEntity
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class HomeUiState(
    val stats: StatsEntity = StatsEntity(),
    val recent: List<SpamLogEntry> = emptyList(),
    val numbers: List<NumberListEntry> = emptyList(),
    val settings: SettingsEntity = SettingsEntity(),
)

class HomeViewModel(private val repo: SpamRepository) : ViewModel() {

    val uiState: StateFlow<HomeUiState> =
        combine(
            repo.statsFlow,
            repo.recentLogFlow,
            repo.numberListFlow,
            repo.settingsFlow,
        ) { stats, recent, numbers, settings ->
            HomeUiState(
                stats = stats ?: StatsEntity(),
                recent = recent,
                numbers = numbers,
                settings = settings ?: SettingsEntity(),
            )
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HomeUiState())

    fun setCallAction(action: CallAction) = viewModelScope.launch {
        repo.updateSettings { it.copy(callAction = action) }
    }

    fun setUseHeuristics(enabled: Boolean) = viewModelScope.launch {
        repo.updateSettings { it.copy(useHeuristics = enabled) }
    }

    fun setUseCarrierMarkers(enabled: Boolean) = viewModelScope.launch {
        repo.updateSettings { it.copy(useCarrierMarkers = enabled) }
    }

    fun markOnboardingComplete() = viewModelScope.launch {
        repo.updateSettings { it.copy(onboardingComplete = true) }
    }

    fun addNumber(number: String, type: ListType) = viewModelScope.launch {
        if (number.isNotBlank()) repo.addNumber(number, type)
    }

    fun removeNumber(entry: NumberListEntry) = viewModelScope.launch {
        repo.removeNumber(entry)
    }

    fun clearAllData() = viewModelScope.launch { repo.clearAllData() }

    class Factory(private val repo: SpamRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            HomeViewModel(repo) as T
    }
}
