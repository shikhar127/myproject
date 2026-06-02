# Room generates code via KSP; default rules are sufficient.
# Keep CallScreeningService / SMS components referenced from the manifest.
-keep class com.spamshield.telecom.SpamCallScreeningService { *; }
-keep class com.spamshield.sms.** { *; }
