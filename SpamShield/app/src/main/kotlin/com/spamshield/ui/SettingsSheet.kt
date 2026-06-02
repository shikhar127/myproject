package com.spamshield.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.spamshield.R
import com.spamshield.data.entity.CallAction
import com.spamshield.data.entity.ListType
import com.spamshield.data.entity.NumberListEntry

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsSheet(
    state: HomeUiState,
    viewModel: HomeViewModel,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            modifier = Modifier
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp)
                .verticalScroll(rememberScrollState()),
        ) {
            SectionTitle("When a call looks like spam")
            CallAction.entries.forEach { action ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .selectable(
                            selected = state.settings.callAction == action,
                            onClick = { viewModel.setCallAction(action) },
                        )
                        .padding(vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    RadioButton(
                        selected = state.settings.callAction == action,
                        onClick = { viewModel.setCallAction(action) },
                    )
                    Text(
                        text = callActionLabel(action),
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier.padding(start = 8.dp),
                    )
                }
            }

            Spacer(Modifier.height(16.dp))
            Divider()
            Spacer(Modifier.height(16.dp))

            SectionTitle("Detection")
            ToggleRow(
                label = "Use message heuristics",
                checked = state.settings.useHeuristics,
                onChange = viewModel::setUseHeuristics,
            )
            ToggleRow(
                label = "Trust carrier spam markers",
                checked = state.settings.useCarrierMarkers,
                onChange = viewModel::setUseCarrierMarkers,
            )

            Spacer(Modifier.height(16.dp))
            Divider()
            Spacer(Modifier.height(16.dp))

            SectionTitle("Block & allow list")
            NumberListEditor(state.numbers, viewModel)

            Spacer(Modifier.height(24.dp))
            Divider()
            Spacer(Modifier.height(16.dp))

            var confirm by remember { mutableStateOf(false) }
            if (!confirm) {
                TextButton(onClick = { confirm = true }) { Text("Clear all data") }
            } else {
                Text(
                    "This resets the spam log and lifetime totals. Your block/allow list is kept.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(8.dp))
                Row {
                    TextButton(onClick = {
                        viewModel.clearAllData()
                        confirm = false
                    }) { Text("Confirm clear", color = MaterialTheme.colorScheme.error) }
                    TextButton(onClick = { confirm = false }) { Text("Cancel") }
                }
            }
        }
    }
}

@Composable
private fun NumberListEditor(numbers: List<NumberListEntry>, viewModel: HomeViewModel) {
    var input by remember { mutableStateOf("") }
    var type by remember { mutableStateOf(ListType.BLOCK) }

    OutlinedTextField(
        value = input,
        onValueChange = { input = it },
        label = { Text("Phone number") },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
        modifier = Modifier.fillMaxWidth(),
    )
    Spacer(Modifier.height(8.dp))
    Row(verticalAlignment = Alignment.CenterVertically) {
        FilterChip(
            selected = type == ListType.BLOCK,
            onClick = { type = ListType.BLOCK },
            label = { Text("Block") },
        )
        Spacer(Modifier.padding(4.dp))
        FilterChip(
            selected = type == ListType.ALLOW,
            onClick = { type = ListType.ALLOW },
            label = { Text("Allow") },
        )
        Spacer(Modifier.padding(8.dp))
        OutlinedButton(onClick = {
            viewModel.addNumber(input, type)
            input = ""
        }) { Text("Add") }
    }

    // #5: group under quiet subheaders so block vs allow is scannable at a glance.
    val blocked = numbers.filter { it.type == ListType.BLOCK }
    val allowed = numbers.filter { it.type == ListType.ALLOW }
    NumberGroup(stringResource(R.string.list_blocked), blocked, viewModel)
    NumberGroup(stringResource(R.string.list_allowed), allowed, viewModel)
}

@Composable
private fun NumberGroup(title: String, entries: List<NumberListEntry>, viewModel: HomeViewModel) {
    if (entries.isEmpty()) return
    Spacer(Modifier.height(12.dp))
    Text(
        text = title,
        style = MaterialTheme.typography.labelMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
    entries.forEach { entry ->
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(text = entry.number, style = MaterialTheme.typography.bodyMedium)
            TextButton(onClick = { viewModel.removeNumber(entry) }) { Text("Remove") }
        }
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleSmall,
        fontWeight = FontWeight.SemiBold,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(bottom = 8.dp),
    )
}

@Composable
private fun ToggleRow(label: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, style = MaterialTheme.typography.bodyLarge)
        Switch(checked = checked, onCheckedChange = onChange)
    }
}

private fun callActionLabel(action: CallAction): String = when (action) {
    CallAction.REJECT -> "Reject the call"
    CallAction.SILENCE -> "Silence the ring (recommended)"
    CallAction.NOTIFY_ONLY -> "Let it ring, just track it"
}
