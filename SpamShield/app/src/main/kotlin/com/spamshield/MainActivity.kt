package com.spamshield

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.compose.runtime.DisposableEffect
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.spamshield.role.RoleStatus
import com.spamshield.ui.HomeScreen
import com.spamshield.ui.HomeViewModel
import com.spamshield.ui.OnboardingScreen
import com.spamshield.ui.theme.SpamShieldTheme

class MainActivity : ComponentActivity() {

    private val viewModel: HomeViewModel by viewModels {
        HomeViewModel.Factory((application as SpamShieldApp).repository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SpamShieldTheme {
                val state by viewModel.uiState.collectAsState()

                // Re-check role grants whenever we return to the app (e.g. after the
                // system role dialog). Roles can also be revoked in system settings.
                var callRoleHeld by remember { mutableStateOf(RoleStatus.isCallScreeningHeld(this)) }
                var smsRoleHeld by remember { mutableStateOf(RoleStatus.isDefaultSmsApp(this)) }
                val lifecycleOwner = LocalLifecycleOwner.current
                DisposableEffect(lifecycleOwner) {
                    val obs = LifecycleEventObserver { _, event ->
                        if (event == Lifecycle.Event.ON_RESUME) {
                            callRoleHeld = RoleStatus.isCallScreeningHeld(this@MainActivity)
                            smsRoleHeld = RoleStatus.isDefaultSmsApp(this@MainActivity)
                        }
                    }
                    lifecycleOwner.lifecycle.addObserver(obs)
                    onDispose { lifecycleOwner.lifecycle.removeObserver(obs) }
                }

                val callLauncher = rememberLauncherForActivityResult(
                    ActivityResultContracts.StartActivityForResult(),
                ) { callRoleHeld = RoleStatus.isCallScreeningHeld(this) }
                val smsLauncher = rememberLauncherForActivityResult(
                    ActivityResultContracts.StartActivityForResult(),
                ) { smsRoleHeld = RoleStatus.isDefaultSmsApp(this) }

                if (!state.settings.onboardingComplete) {
                    OnboardingScreen(
                        callRoleHeld = callRoleHeld,
                        smsRoleHeld = smsRoleHeld,
                        onRequestCallRole = {
                            RoleStatus.requestCallScreeningIntent(this)?.let(callLauncher::launch)
                        },
                        onRequestSmsRole = {
                            RoleStatus.requestDefaultSmsIntent(this)?.let(smsLauncher::launch)
                        },
                        onContinue = viewModel::markOnboardingComplete,
                    )
                } else {
                    HomeScreen(state = state, viewModel = viewModel)
                }
            }
        }
    }
}
