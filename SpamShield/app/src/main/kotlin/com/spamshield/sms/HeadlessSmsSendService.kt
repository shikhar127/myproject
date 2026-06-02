package com.spamshield.sms

import android.app.Service
import android.content.Intent
import android.os.IBinder

/**
 * Required component #4 for default-SMS eligibility: RESPOND_VIA_MESSAGE service.
 *
 * Android requires the default SMS app to expose this so the phone's "reply with a
 * message" feature (during an incoming call) has somewhere to deliver to. SpamShield
 * is a filter, not a full messenger, so we don't implement quick-reply sending here;
 * the declaration is mandatory for the role, which is why this exists.
 */
class HeadlessSmsSendService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null
}
