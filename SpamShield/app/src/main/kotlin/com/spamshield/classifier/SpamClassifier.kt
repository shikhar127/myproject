package com.spamshield.classifier

import com.spamshield.data.entity.ListType
import com.spamshield.data.entity.Verdict

/**
 * The ONLY decision-making class. 100% local, no network, no I/O.
 *
 * Inputs are passed in (the caller looks up the list type from the DB first) so this
 * class stays pure and unit-testable. Message bodies are evaluated here in memory and
 * are NEVER returned, logged, or stored — only a verdict + the name of the rule that fired.
 */
class SpamClassifier {

    data class Signals(
        /** Allow/Block membership for the sender, if any (already looked up). */
        val listType: ListType? = null,
        /** Carrier-/CNAP-injected display string, if the channel exposes one. */
        val callerDisplayName: String? = null,
        /** SMS body — read in memory only; discarded after this call. */
        val body: String? = null,
        /**
         * STIR/SHAKEN result for calls (Call.Details.callerNumberVerificationStatus).
         * true == the network FAILED to verify the caller (a spoofing signal).
         */
        val callVerificationFailed: Boolean = false,
        val useHeuristics: Boolean = true,
        val useCarrierMarkers: Boolean = true,
    )

    data class Result(val verdict: Verdict, val ruleFired: String)

    fun classify(signals: Signals): Result {
        // 1. Explicit user lists always win.
        when (signals.listType) {
            ListType.ALLOW -> return Result(Verdict.HAM, "ALLOWLIST")
            ListType.BLOCK -> return Result(Verdict.SPAM, "BLOCKLIST")
            null -> Unit
        }

        // 2. Carrier-injected spam markers in the caller/sender display string.
        //    Airtel & others tag suspected spam in CNAP, e.g. "Suspected Spam", "-S".
        if (signals.useCarrierMarkers && hasCarrierSpamMarker(signals.callerDisplayName)) {
            return Result(Verdict.SPAM, "CARRIER_MARKER")
        }

        // 3. Network failed to verify the caller (likely spoofed).
        if (signals.callVerificationFailed) {
            return Result(Verdict.SPAM, "UNVERIFIED_CALLER")
        }

        // 4. Lightweight body heuristics (SMS only). Evaluated in memory, then discarded.
        if (signals.useHeuristics && !signals.body.isNullOrBlank()) {
            bodyRuleThatFires(signals.body)?.let { return Result(Verdict.SPAM, it) }
        }

        return Result(Verdict.HAM, "NONE")
    }

    private fun hasCarrierSpamMarker(display: String?): Boolean {
        if (display.isNullOrBlank()) return false
        val d = display.lowercase()
        if (CARRIER_MARKERS.any { d.contains(it) }) return true
        // A standalone word like "SPAM", "Scam" or "Fraud" anywhere in the caller name —
        // covers Airtel's "Suspected SPAM" as well as a bare "SPAM" label.
        if (WORD_MARKER.containsMatchIn(display)) return true
        // Trailing "-S" / "(S)" style suffix some carriers append for "spam".
        return SUFFIX_MARKER.containsMatchIn(display.trim())
    }

    /** Returns the rule name if a body heuristic fires, else null. */
    private fun bodyRuleThatFires(body: String): String? {
        val b = body.lowercase()
        if (KEYWORDS.any { b.contains(it) }) return "KEYWORD"
        if (URL_SHORTENER.containsMatchIn(b)) return "SHORTENED_URL"
        // "Reply STOP", lottery-style ALL-CAPS shouting, or money + link combos.
        if (MONEY.containsMatchIn(body) && URL_ANY.containsMatchIn(body)) return "MONEY_PLUS_LINK"
        return null
    }

    companion object {
        private val CARRIER_MARKERS = listOf(
            "suspected spam", "spam likely", "scam likely", "potential spam",
            "telemarketer", "fraud",
        )
        private val WORD_MARKER = Regex("""\b(spam|scam|fraud)\b""", RegexOption.IGNORE_CASE)
        private val SUFFIX_MARKER = Regex("""[\s(]-?[Ss]\)?$""")

        private val KEYWORDS = listOf(
            "you have won", "lottery", "claim your prize", "congratulations you",
            "kyc update", "kyc suspended", "verify your account", "otp for",
            "loan approved", "click here to claim", "urgent action required",
            "your account will be blocked", "redeem now",
        )
        private val URL_SHORTENER = Regex(
            """\b(bit\.ly|tinyurl|t\.co|goo\.gl|rb\.gy|cutt\.ly|is\.gd)\b""",
        )
        private val URL_ANY = Regex("""https?://|www\.""", RegexOption.IGNORE_CASE)
        private val MONEY = Regex("""(₹|rs\.?\s?|inr\s?)\s?\d|\$\d""", RegexOption.IGNORE_CASE)
    }
}
