package com.spamshield.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.spamshield.data.entity.ListType
import com.spamshield.data.entity.NumberListEntry
import kotlinx.coroutines.flow.Flow

@Dao
interface NumberListDao {
    @Query("SELECT * FROM number_list ORDER BY type, number")
    fun observeAll(): Flow<List<NumberListEntry>>

    @Query("SELECT type FROM number_list WHERE number = :number LIMIT 1")
    suspend fun typeOf(number: String): ListType?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entry: NumberListEntry)

    @Delete
    suspend fun delete(entry: NumberListEntry)

    @Query("DELETE FROM number_list")
    suspend fun clear()
}
