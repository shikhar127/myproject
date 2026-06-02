package com.spamshield.data

import android.content.Context
import com.spamshield.data.entity.Channel
import com.spamshield.data.entity.ListType
import com.spamshield.data.entity.NumberListEntry
import com.spamshield.data.entity.SettingsEntity
import com.spamshield.data.entity.SpamLogEntry
import com.spamshield.data.entity.StatsEntity
import com.spamshield.data.entity.Verdict
import kotlinx.coroutines.flow.Flow

/**
 * Single funnel for all reads/writes. The only place that records events.
 * Enforces: stats increment + first_active set + spam_log insert with 200-row cap.
 */
class SpamRepository(context: Context) {

    private val db = AppDatabase.get(context)
    private val numbers = db.numberListDao()
    private val settings = db.settingsDao()
    private val log = db.spamLogDao()
    private val stats = db.statsDao()

    val settingsFlow: Flow<SettingsEntity?> = settings.observe()
    val statsFlow: Flow<StatsEntity?> = stats.observe()
    val recentLogFlow: Flow<List<SpamLogEntry>> = log.observeRecent(50)
    val numberListFlow: Flow<List<NumberListEntry>> = numbers.observeAll()

    suspend fun listTypeOf(number: String): ListType? = numbers.typeOf(normalize(number))

    suspend fun getSettings(): SettingsEntity =
        settings.get() ?: SettingsEntity().also { settings.upsert(it) }

    suspend fun updateSettings(transform: (SettingsEntity) -> SettingsEntity) {
        settings.upsert(transform(getSettings()))
    }

    suspend fun addNumber(number: String, type: ListType, label: String? = null) =
        numbers.upsert(NumberListEntry(normalize(number), type, label))

    suspend fun removeNumber(entry: NumberListEntry) = numbers.delete(entry)

    /**
     * Records ONE classification outcome. Called by the call screener and SMS receiver.
     * Persists only metadata — never the call audio or message body.
     */
    suspend fun recordEvent(
        rawSender: String?,
        verdict: Verdict,
        channel: Channel,
        ruleFired: String,
    ) {
        ensureStatsRow()
        when (channel) {
            Channel.CALL -> if (verdict == Verdict.SPAM) stats.incrementCalls()
            Channel.SMS -> if (verdict == Verdict.SPAM) stats.incrementSms()
        }
        log.insertAndPrune(
            SpamLogEntry(
                timestamp = System.currentTimeMillis(),
                senderPartial = mask(rawSender),
                verdict = verdict,
                channel = channel,
                ruleFired = ruleFired,
            ),
            keep = LOG_CAP,
        )
    }

    /** "Clear all data": wipe the log and reset lifetime stats incl. first_active. */
    suspend fun clearAllData() {
        log.clear()
        stats.upsert(StatsEntity())
    }

    private suspend fun ensureStatsRow() {
        val current = stats.get()
        if (current == null) {
            stats.upsert(StatsEntity(firstActiveTimestamp = System.currentTimeMillis()))
        } else if (current.firstActiveTimestamp == null) {
            stats.upsert(current.copy(firstActiveTimestamp = System.currentTimeMillis()))
        }
    }

    companion object {
        const val LOG_CAP = 200

        /** Strip everything but digits and a leading +, for stable matching. */
        fun normalize(number: String): String {
            val trimmed = number.trim()
            val plus = if (trimmed.startsWith("+")) "+" else ""
            return plus + trimmed.filter { it.isDigit() }
        }

        /**
         * Reduce a number to a privacy-preserving mask: last 4 digits only,
         * e.g. "•••• 4321". Never stores the full number.
         */
        fun mask(number: String?): String {
            if (number.isNullOrBlank()) return "Unknown"
            val digits = number.filter { it.isDigit() }
            if (digits.length <= 4) return "•••• $digits"
            return "•••• " + digits.takeLast(4)
        }
    }
}
