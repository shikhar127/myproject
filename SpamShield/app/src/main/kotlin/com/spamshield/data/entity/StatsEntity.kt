package com.spamshield.data.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Single-row lifetime counters. Incremented on EVERY block/filter event so the
 * headline totals survive spam_log pruning (the log is capped at 200 rows, so
 * counting log rows would undercount lifetime totals).
 */
@Entity(tableName = "stats")
data class StatsEntity(
    @PrimaryKey val id: Int = SINGLETON_ID,
    @ColumnInfo(name = "total_calls_blocked") val totalCallsBlocked: Long = 0,
    @ColumnInfo(name = "total_sms_filtered") val totalSmsFiltered: Long = 0,
    /** Epoch millis when the app first became active; null until the first event. */
    @ColumnInfo(name = "first_active_timestamp") val firstActiveTimestamp: Long? = null,
) {
    companion object { const val SINGLETON_ID = 0 }
}
