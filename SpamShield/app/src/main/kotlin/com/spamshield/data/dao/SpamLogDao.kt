package com.spamshield.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Transaction
import com.spamshield.data.entity.SpamLogEntry
import kotlinx.coroutines.flow.Flow

@Dao
interface SpamLogDao {
    @Query("SELECT * FROM spam_log ORDER BY timestamp DESC LIMIT :limit")
    fun observeRecent(limit: Int = 50): Flow<List<SpamLogEntry>>

    @Insert
    suspend fun insert(entry: SpamLogEntry)

    /** Keep only the most recent [keep] rows. */
    @Query(
        "DELETE FROM spam_log WHERE id NOT IN " +
            "(SELECT id FROM spam_log ORDER BY timestamp DESC LIMIT :keep)",
    )
    suspend fun prune(keep: Int)

    @Query("DELETE FROM spam_log")
    suspend fun clear()

    /** Insert then prune in one transaction so the cap is enforced atomically. */
    @Transaction
    suspend fun insertAndPrune(entry: SpamLogEntry, keep: Int) {
        insert(entry)
        prune(keep)
    }
}
