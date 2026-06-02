package com.spamshield.sms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Required component #2 for default-SMS eligibility: the WAP_PUSH_DELIVER receiver.
 *
 * The system will not let an app become the default SMS app unless it declares an MMS
 * receiver. SpamShield does not parse or store MMS content (no body storage, no network
 * to fetch attachments), so this is intentionally a no-op placeholder that exists purely
 * to satisfy the eligibility contract.
 */
class MmsReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // Intentionally empty: MMS handling is out of scope; declaration is mandatory.
    }
}
