package com.spamshield.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.spamshield.R

@Composable
fun OnboardingScreen(
    callRoleHeld: Boolean,
    smsRoleHeld: Boolean,
    callRoleAvailable: Boolean,
    smsRoleAvailable: Boolean,
    onRequestCallRole: () -> Unit,
    onRequestSmsRole: () -> Unit,
    onContinue: () -> Unit,
) {
    Scaffold { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 28.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.Center,
        ) {
            Spacer(Modifier.height(32.dp))
            Text(
                text = stringResource(R.string.onboarding_title),
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(12.dp))
            Text(
                text = stringResource(R.string.onboarding_subtitle),
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Spacer(Modifier.height(40.dp))
            RoleRequest(
                title = stringResource(R.string.role_call_title),
                why = stringResource(R.string.role_call_why),
                granted = callRoleHeld,
                available = callRoleAvailable,
                onRequest = onRequestCallRole,
            )
            Spacer(Modifier.height(28.dp))
            RoleRequest(
                title = stringResource(R.string.role_sms_title),
                why = stringResource(R.string.role_sms_why),
                granted = smsRoleHeld,
                available = smsRoleAvailable,
                onRequest = onRequestSmsRole,
            )

            Spacer(Modifier.height(40.dp))
            Text(
                text = stringResource(R.string.reality_note),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Spacer(Modifier.height(40.dp))
            Button(
                onClick = onContinue,
                modifier = Modifier.fillMaxWidth(),
            ) { Text(stringResource(R.string.continue_action)) }
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun RoleRequest(
    title: String,
    why: String,
    granted: Boolean,
    available: Boolean,
    onRequest: () -> Unit,
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            when {
                // Calm success indicator — a check + word, not a dead disabled button.
                granted -> Text(
                    text = "✓ ${stringResource(R.string.granted)}",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                )
                // #2: never leave a "Grant" button that silently does nothing.
                !available -> Text(
                    text = stringResource(R.string.role_unavailable),
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                else -> OutlinedButton(onClick = onRequest) {
                    Text(stringResource(R.string.grant))
                }
            }
        }
        Spacer(Modifier.height(6.dp))
        Text(
            text = why,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
