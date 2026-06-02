package com.spamshield.sms

import android.app.Activity
import android.os.Bundle

/**
 * Required component #3 for default-SMS eligibility: a compose / "sendto" activity.
 *
 * The system requires the default SMS app to provide a UI that can handle sms:/smsto:
 * send intents. SpamShield deliberately does NOT build a full messaging composer (that
 * would be feature creep beyond "silence spam, sort spam, show how much it helped").
 * This activity satisfies the eligibility contract and immediately finishes; sending a
 * text is left to the user's preferred messenger.
 */
class ComposeSmsActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // No composer UI by design; close immediately.
        finish()
    }
}
