package com.spamshield.role

import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.provider.Telephony

/**
 * Thin helpers around the two roles the app can hold. We only ever *request* roles
 * through the system RoleManager dialog — we never grant ourselves anything.
 */
object RoleStatus {

    fun isCallScreeningHeld(context: Context): Boolean {
        val rm = context.getSystemService(RoleManager::class.java) ?: return false
        return rm.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING) &&
            rm.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)
    }

    fun isDefaultSmsApp(context: Context): Boolean =
        context.packageName == Telephony.Sms.getDefaultSmsPackage(context)

    /** Intent that opens the system dialog asking the user to make us the call screener. */
    fun requestCallScreeningIntent(context: Context): Intent? {
        val rm = context.getSystemService(RoleManager::class.java) ?: return null
        if (!rm.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) return null
        return rm.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
    }

    /**
     * Intent that asks the user to make us the default SMS app.
     * ROLE_SMS via RoleManager is the modern path (API 29+).
     */
    fun requestDefaultSmsIntent(context: Context): Intent? {
        val rm = context.getSystemService(RoleManager::class.java) ?: return null
        if (!rm.isRoleAvailable(RoleManager.ROLE_SMS)) return null
        return rm.createRequestRoleIntent(RoleManager.ROLE_SMS)
    }
}
