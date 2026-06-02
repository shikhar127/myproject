package com.spamshield.telecom

import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import com.spamshield.SpamShieldApp
import com.spamshield.classifier.SpamClassifier
import com.spamshield.data.entity.CallAction
import com.spamshield.data.entity.Channel
import com.spamshield.data.entity.Verdict
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/**
 * Invoked by the telecom stack for every incoming call BEFORE the user is disturbed,
 * but only while the app holds ROLE_CALL_SCREENING.
 *
 * Honest scope: we cannot prevent the call from reaching the network/device. We decide,
 * the instant it arrives, whether to silence / reject / let it ring — per user setting.
 */
class SpamCallScreeningService : CallScreeningService() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val classifier = SpamClassifier()

    override fun onScreenCall(callDetails: Call.Details) {
        // Only screen genuinely incoming calls.
        if (callDetails.callDirection != Call.Details.DIRECTION_INCOMING) {
            respondToCall(callDetails, CallResponse.Builder().build())
            return
        }

        val rawNumber = callDetails.handle?.schemeSpecificPart
        val displayName = callDetails.callerDisplayName
        val verificationFailed = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R &&
            callDetails.callerNumberVerificationStatus ==
            Call.Details.CALLER_NUMBER_VERIFICATION_STATUS_FAILED

        // DB lookups + recording happen off the main thread; respond when done.
        scope.launch {
            val repo = (application as SpamShieldApp).repository
            val settings = repo.getSettings()
            val listType = rawNumber?.let { repo.listTypeOf(it) }

            val result = classifier.classify(
                SpamClassifier.Signals(
                    listType = listType,
                    callerDisplayName = displayName,
                    callVerificationFailed = verificationFailed,
                    useHeuristics = settings.useHeuristics,
                    useCarrierMarkers = settings.useCarrierMarkers,
                ),
            )

            val response = if (result.verdict == Verdict.SPAM) {
                repo.recordEvent(rawNumber, Verdict.SPAM, Channel.CALL, result.ruleFired)
                buildSpamResponse(settings.callAction)
            } else {
                CallResponse.Builder().build() // allow normally
            }
            respondToCall(callDetails, response)
        }
    }

    private fun buildSpamResponse(action: CallAction): CallResponse {
        val b = CallResponse.Builder()
        return when (action) {
            CallAction.REJECT ->
                // Disallow the call entirely; nothing rings, nothing notifies.
                b.setDisallowCall(true)
                    .setRejectCall(true)
                    .setSkipCallLog(false)        // keep it in the log so the user can review
                    .setSkipNotification(true)
                    .build()
            CallAction.SILENCE ->
                // Let it through but silenced: no ring/buzz, still in call log.
                b.setSilenceCall(true).build()
            CallAction.NOTIFY_ONLY ->
                // Least aggressive: allow it to ring; we only recorded the event.
                b.build()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }
}
