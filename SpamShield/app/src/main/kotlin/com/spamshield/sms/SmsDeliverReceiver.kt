package com.spamshield.sms

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import androidx.core.app.NotificationCompat
import com.spamshield.MainActivity
import com.spamshield.R
import com.spamshield.SpamShieldApp
import com.spamshield.classifier.SpamClassifier
import com.spamshield.data.entity.Channel
import com.spamshield.data.entity.Verdict
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Receives SMS_DELIVER — the broadcast ONLY the default SMS app gets. This is the one
 * place incoming text is read. We classify in memory, then store the message in the OS
 * Telephony provider (never our DB) and record only metadata.
 */
class SmsDeliverReceiver : BroadcastReceiver() {

    private val classifier = SpamClassifier()

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_DELIVER_ACTION) return

        // Reassemble multipart SMS into sender + full body, in memory only.
        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
        if (messages.isEmpty()) return
        val sender = messages.first().originatingAddress
        val body = messages.joinToString("") { it.messageBody ?: "" }
        val timestamp = System.currentTimeMillis()

        val app = context.applicationContext as SpamShieldApp
        val repo = app.repository

        val pending = goAsync()
        CoroutineScope(SupervisorJob() + Dispatchers.IO).launch {
            try {
                val settings = repo.getSettings()
                val listType = sender?.let { repo.listTypeOf(it) }
                val result = classifier.classify(
                    SpamClassifier.Signals(
                        listType = listType,
                        callerDisplayName = sender, // carrier markers can ride in the sender id
                        body = body,                // evaluated in memory, discarded below
                        useHeuristics = settings.useHeuristics,
                        useCarrierMarkers = settings.useCarrierMarkers,
                    ),
                )

                if (result.verdict == Verdict.SPAM) {
                    SmsWriter.writeSpam(context, sender, body, timestamp)
                    repo.recordEvent(sender, Verdict.SPAM, Channel.SMS, result.ruleFired)
                    // No notification for spam — that's the whole point.
                } else {
                    SmsWriter.writeHam(context, sender, body, timestamp)
                    notifyHam(context, sender)
                }
                // `body` goes out of scope here and is never persisted by us.
            } finally {
                pending.finish()
            }
        }
    }

    private fun notifyHam(context: Context, sender: String?) {
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        val open = PendingIntent.getActivity(
            context, 0, Intent(context, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val notification = NotificationCompat.Builder(context, SpamShieldApp.SMS_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(sender ?: "New message")
            .setContentText("You have a new message")
            .setAutoCancel(true)
            .setContentIntent(open)
            .build()
        nm.notify(sender.hashCode(), notification)
    }
}
