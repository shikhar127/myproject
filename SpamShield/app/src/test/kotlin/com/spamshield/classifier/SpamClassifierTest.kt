package com.spamshield.classifier

import com.spamshield.data.entity.ListType
import com.spamshield.data.entity.Verdict
import org.junit.Assert.assertEquals
import org.junit.Test

class SpamClassifierTest {

    private val c = SpamClassifier()

    @Test fun allowlistAlwaysWins() {
        val r = c.classify(
            SpamClassifier.Signals(
                listType = ListType.ALLOW,
                callerDisplayName = "Suspected Spam",
                body = "You have won a lottery",
            ),
        )
        assertEquals(Verdict.HAM, r.verdict)
        assertEquals("ALLOWLIST", r.ruleFired)
    }

    @Test fun blocklistIsSpam() {
        val r = c.classify(SpamClassifier.Signals(listType = ListType.BLOCK))
        assertEquals(Verdict.SPAM, r.verdict)
        assertEquals("BLOCKLIST", r.ruleFired)
    }

    @Test fun carrierMarkerInDisplayName() {
        val r = c.classify(SpamClassifier.Signals(callerDisplayName = "Suspected Spam"))
        assertEquals(Verdict.SPAM, r.verdict)
        assertEquals("CARRIER_MARKER", r.ruleFired)
    }

    @Test fun unverifiedCallerIsSpam() {
        val r = c.classify(SpamClassifier.Signals(callVerificationFailed = true))
        assertEquals(Verdict.SPAM, r.verdict)
    }

    @Test fun keywordHeuristicFires() {
        val r = c.classify(SpamClassifier.Signals(body = "URGENT: your KYC suspended, verify your account"))
        assertEquals(Verdict.SPAM, r.verdict)
    }

    @Test fun ordinaryMessageIsHam() {
        val r = c.classify(SpamClassifier.Signals(body = "Hey, running 10 minutes late!"))
        assertEquals(Verdict.HAM, r.verdict)
        assertEquals("NONE", r.ruleFired)
    }

    @Test fun heuristicsDisabledSkipsBody() {
        val r = c.classify(
            SpamClassifier.Signals(body = "You have won a lottery", useHeuristics = false),
        )
        assertEquals(Verdict.HAM, r.verdict)
    }
}
