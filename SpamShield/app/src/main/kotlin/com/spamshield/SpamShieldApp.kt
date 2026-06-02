package com.spamshield

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import com.spamshield.data.SpamRepository

class SpamShieldApp : Application() {

    /** Process-wide repository. No DI framework needed for an app this small. */
    val repository: SpamRepository by lazy { SpamRepository(this) }

    override fun onCreate() {
        super.onCreate()
        createSmsChannel()
    }

    private fun createSmsChannel() {
        val channel = NotificationChannel(
            SMS_CHANNEL_ID,
            "Messages",
            NotificationManager.IMPORTANCE_HIGH,
        ).apply { description = "New (non-spam) text messages" }
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    companion object {
        const val SMS_CHANNEL_ID = "sms_messages"
    }
}
