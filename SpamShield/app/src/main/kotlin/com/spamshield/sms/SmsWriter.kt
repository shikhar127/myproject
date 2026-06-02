package com.spamshield.sms

import android.content.ContentValues
import android.content.Context
import android.provider.Telephony

/**
 * Writes incoming messages into the SYSTEM SMS provider (Telephony) — NOT into the
 * app's own database. As the default SMS app, Android stops auto-persisting messages,
 * so we are responsible for storing them in the OS provider or they are lost.
 *
 * PRIVACY: the body lives ONLY in the OS-owned Telephony store (the same place every
 * SMS app reads). SpamShield's own Room DB never receives the body.
 *
 * "Spam folder": Android's Telephony provider has no native spam box, so we store spam
 * silently (already marked read + seen, no notification) and surface only its metadata
 * in-app. Ham goes to the inbox and notifies as usual.
 */
object SmsWriter {

    fun writeHam(context: Context, sender: String?, body: String, timestamp: Long) {
        insert(context, sender, body, timestamp, read = false, seen = false)
    }

    fun writeSpam(context: Context, sender: String?, body: String, timestamp: Long) {
        // Marked read + seen so it never shows an unread badge or disturbs the user.
        insert(context, sender, body, timestamp, read = true, seen = true)
    }

    private fun insert(
        context: Context,
        sender: String?,
        body: String,
        timestamp: Long,
        read: Boolean,
        seen: Boolean,
    ) {
        val values = ContentValues().apply {
            put(Telephony.Sms.ADDRESS, sender)
            put(Telephony.Sms.BODY, body)
            put(Telephony.Sms.DATE, timestamp)
            put(Telephony.Sms.READ, if (read) 1 else 0)
            put(Telephony.Sms.SEEN, if (seen) 1 else 0)
            put(Telephony.Sms.TYPE, Telephony.Sms.MESSAGE_TYPE_INBOX)
        }
        context.contentResolver.insert(Telephony.Sms.Inbox.CONTENT_URI, values)
    }
}
