package com.spamshield.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * One row per block/filter event. Capped at the most recent 200 (auto-pruned).
 *
 * PRIVACY: we store NO message body and NO call audio. The sender is stored only
 * as a partial mask (e.g. "•••• 4321"), never the full number, never the content.
 */
@Entity(tableName = "spam_log")
data class SpamLogEntry(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestamp: Long,
    /** Masked / partial sender — last few digits only. Never the full number. */
    val senderPartial: String,
    val verdict: Verdict,
    val channel: Channel,
    /** Short name of the rule that fired, e.g. "BLOCKLIST", "KEYWORD", "CARRIER_MARKER". */
    val ruleFired: String,
)

enum class Verdict { SPAM, HAM }
enum class Channel { CALL, SMS }
