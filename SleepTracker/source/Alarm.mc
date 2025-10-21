using Toybox.Attention;
using Toybox.Timer;
using Toybox.System;

class AlarmManager {

    var isActive = false;
    var snoozeTimer = null;
    var snoozeCallback = null;

    function initialize() {
    }

    function start() {
        isActive = true;
        triggerAttention();
    }

    function stop() {
        isActive = false;
        if (snoozeTimer != null) {
            snoozeTimer.stop();
            snoozeTimer = null;
        }
    }

    function triggerAttention() {
        if (Attention has :playTone) {
            // Vibrate + tone
            var vibeData = [
                new Attention.VibeProfile(50, 1000),
                new Attention.VibeProfile(0, 500),
                new Attention.VibeProfile(50, 1000),
                new Attention.VibeProfile(0, 500),
                new Attention.VibeProfile(50, 1000)
            ];

            try {
                Attention.playTone(Attention.TONE_ALARM);
            } catch (e) {
                // Some devices don't support audio
            }

            Attention.vibrate(vibeData);
        } else {
            // Fallback: just vibrate
            var vibeData = [
                new Attention.VibeProfile(100, 2000)
            ];
            Attention.vibrate(vibeData);
        }
    }

    function snooze(callback) {
        stop();
        snoozeCallback = callback;
        snoozeTimer = new Timer.Timer();
        snoozeTimer.start(method(:onSnoozeExpire), 300000, false); // 5 minutes
        System.println("Snoozed for 5 minutes");
    }

    function onSnoozeExpire() {
        snoozeTimer = null;
        if (snoozeCallback != null) {
            snoozeCallback.invoke();
        }
    }
}
