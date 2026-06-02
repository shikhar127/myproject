package com.spamshield.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.spamshield.data.entity.StatsEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface StatsDao {
    @Query("SELECT * FROM stats WHERE id = 0")
    fun observe(): Flow<StatsEntity?>

    @Query("SELECT * FROM stats WHERE id = 0")
    suspend fun get(): StatsEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(stats: StatsEntity)

    @Query("UPDATE stats SET total_calls_blocked = total_calls_blocked + 1 WHERE id = 0")
    suspend fun incrementCalls()

    @Query("UPDATE stats SET total_sms_filtered = total_sms_filtered + 1 WHERE id = 0")
    suspend fun incrementSms()
}
