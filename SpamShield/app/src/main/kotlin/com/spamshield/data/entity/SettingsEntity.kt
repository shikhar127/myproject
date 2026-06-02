package com.spamshield.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/** Single-row settings table (id is always 0). A handful of switches/enums only. */
@Entity(tableName = "settings")
data class SettingsEntity(
    @PrimaryKey val id: Int = SINGLETON_ID,
    val callAction: CallAction = CallAction.SILENCE,
    val onboardingComplete: Boolean = false,
    val useHeuristics: Boolean = true,
    val useCarrierMarkers: Boolean = true,
) {
    companion object { const val SINGLETON_ID = 0 }
}

/** What to do with a call classified as spam. */
enum class CallAction {
    /** Reject outright — caller hears the line drop / goes to voicemail. */
    REJECT,
    /** Let it through silently with no ring/buzz; still appears in call log. */
    SILENCE,
    /** Allow it to ring but mark it; least aggressive. */
    NOTIFY_ONLY,
}
