package com.spamshield.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.spamshield.data.dao.NumberListDao
import com.spamshield.data.dao.SettingsDao
import com.spamshield.data.dao.SpamLogDao
import com.spamshield.data.dao.StatsDao
import com.spamshield.data.entity.NumberListEntry
import com.spamshield.data.entity.SettingsEntity
import com.spamshield.data.entity.SpamLogEntry
import com.spamshield.data.entity.StatsEntity

@Database(
    entities = [
        NumberListEntry::class,
        SettingsEntity::class,
        SpamLogEntry::class,
        StatsEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun numberListDao(): NumberListDao
    abstract fun settingsDao(): SettingsDao
    abstract fun spamLogDao(): SpamLogDao
    abstract fun statsDao(): StatsDao

    companion object {
        @Volatile private var instance: AppDatabase? = null

        fun get(context: Context): AppDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "spamshield.db",
                ).build().also { instance = it }
            }
    }
}
