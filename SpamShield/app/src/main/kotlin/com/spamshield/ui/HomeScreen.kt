package com.spamshield.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.foundation.clickable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.spamshield.R
import com.spamshield.data.entity.Channel
import com.spamshield.data.entity.SpamLogEntry
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    state: HomeUiState,
    viewModel: HomeViewModel,
    callRoleHeld: Boolean,
    smsRoleHeld: Boolean,
    onRequestCallRole: () -> Unit,
    onRequestSmsRole: () -> Unit,
) {
    var showSettings by remember { mutableStateOf(false) }
    val nothingYet = state.stats.totalCallsBlocked == 0L && state.stats.totalSmsFiltered == 0L

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.app_name)) },
                actions = {
                    TextButton(onClick = { showSettings = true }) {
                        Text(stringResource(R.string.settings))
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 24.dp),
        ) {
            // #6: quiet nudges when protection is off, so the screen isn't silently inert.
            if (!callRoleHeld) StatusNudge(stringResource(R.string.nudge_call_off), onRequestCallRole)
            if (!smsRoleHeld) StatusNudge(stringResource(R.string.nudge_sms_off), onRequestSmsRole)

            if (nothingYet) {
                // #1: calm empty state instead of a wall of zeros.
                EmptyState()
            } else {
                StatsHero(state)
                Spacer(Modifier.height(32.dp))
                RecentList(state.recent)
            }
        }
    }

    if (showSettings) {
        SettingsSheet(
            state = state,
            viewModel = viewModel,
            onDismiss = { showSettings = false },
        )
    }
}

@Composable
private fun EmptyState() {
    Spacer(Modifier.height(48.dp))
    Text(
        text = stringResource(R.string.empty_state),
        style = MaterialTheme.typography.titleLarge,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
}

@Composable
private fun StatusNudge(text: String, onClick: () -> Unit) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp),
    )
}

@Composable
private fun StatsHero(state: HomeUiState) {
    val calls = state.stats.totalCallsBlocked
    val sms = state.stats.totalSmsFiltered
    val callsLabel = stringResource(
        if (calls == 1L) R.string.calls_silenced_one else R.string.calls_silenced_other,
    )
    val smsLabel = stringResource(
        if (sms == 1L) R.string.sms_filtered_one else R.string.sms_filtered_other,
    )

    Spacer(Modifier.height(24.dp))
    // The hero: big confident numerals, everything else quiet. Each numeral + label is
    // merged into one semantics node so TalkBack reads "147 spam calls silenced".
    HeroStat(value = calls, label = callsLabel)
    Spacer(Modifier.height(16.dp))
    HeroStat(value = sms, label = smsLabel)

    state.stats.firstActiveTimestamp?.let { ts ->
        Spacer(Modifier.height(12.dp))
        Text(
            text = "Since ${formatDate(ts)}",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun HeroStat(value: Long, label: String) {
    Column(
        modifier = Modifier.clearAndSetSemantics { contentDescription = "$value $label" },
    ) {
        Text(text = "$value", style = MaterialTheme.typography.displayLarge)
        Text(
            text = label,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun RecentList(recent: List<SpamLogEntry>) {
    if (recent.isEmpty()) {
        Text(
            text = stringResource(R.string.empty_state),
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        return
    }
    Text(
        text = stringResource(R.string.recent_header),
        style = MaterialTheme.typography.titleSmall,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
    Spacer(Modifier.height(8.dp))
    LazyColumn {
        items(recent, key = { it.id }) { entry -> RecentRow(entry) }
    }
}

@Composable
private fun RecentRow(entry: SpamLogEntry) {
    // One spare line per row: time · channel · partial number. No avatars/icons.
    val channel = if (entry.channel == Channel.CALL) "Call" else "SMS"
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = "${formatTime(entry.timestamp)} · $channel · ${entry.senderPartial}",
            style = MaterialTheme.typography.bodyMedium,
        )
        Text(
            text = entry.verdict.name.lowercase().replaceFirstChar { it.uppercase() },
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

private val dateFmt = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.getDefault())
private val timeFmt = DateTimeFormatter.ofPattern("d MMM, HH:mm", Locale.getDefault())

private fun formatDate(ts: Long): String =
    Instant.ofEpochMilli(ts).atZone(ZoneId.systemDefault()).format(dateFmt)

private fun formatTime(ts: Long): String =
    Instant.ofEpochMilli(ts).atZone(ZoneId.systemDefault()).format(timeFmt)
