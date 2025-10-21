using Toybox.Application as App;
using Toybox.WatchUi as Ui;
using Toybox.Timer;
using Toybox.System;

// App states
enum AppState {
    STATE_IDLE,
    STATE_DETECTING,
    STATE_SLEEPING,
    STATE_ALARM
}

class SleepTrackerApp extends App.AppBase {

    var state = STATE_IDLE;
    var mode = :night; // :night or :nap
    var targetSecs = 28800; // 8 hours default
    var capSecs = 1800; // 30 minutes default

    var sleepModel;
    var alarm;
    var mainView;
    var updateTimer;

    function initialize() {
        AppBase.initialize();
    }

    function onStart(state) {
    }

    function onStop(state) {
        stopTracking();
    }

    function getInitialView() {
        sleepModel = new SleepModel();
        alarm = new AlarmManager();
        mainView = new SleepTrackerView();

        // Start 5-second update timer
        updateTimer = new Timer.Timer();
        updateTimer.start(method(:onTimerTick), 5000, true);

        return [mainView, new SleepTrackerDelegate()];
    }

    function onTimerTick() {
        // Update model
        if (state == STATE_DETECTING or state == STATE_SLEEPING) {
            sleepModel.update();

            // Check for sleep onset
            if (state == STATE_DETECTING and sleepModel.isSleeping()) {
                state = STATE_SLEEPING;
                sleepModel.markSleepStart();
            }

            // Check for alarm trigger
            if (state == STATE_SLEEPING) {
                var elapsed = sleepModel.getElapsedSleep();
                var shouldAlarm = false;

                if (mode == :nap) {
                    // Nap: trigger at cap
                    if (elapsed >= capSecs) {
                        shouldAlarm = true;
                    }
                } else {
                    // Night: trigger at target or gentle wake
                    if (elapsed >= targetSecs) {
                        shouldAlarm = true;
                    } else if (targetSecs - elapsed <= 600) {
                        // Last 10 minutes: check gentle wake
                        if (sleepModel.isGentleWake()) {
                            shouldAlarm = true;
                        }
                    }
                }

                if (shouldAlarm) {
                    triggerAlarm();
                }
            }
        }

        // Update UI
        Ui.requestUpdate();
    }

    function startNight() {
        mode = :night;
        targetSecs = 28800; // 8 hours
        state = STATE_DETECTING;
        sleepModel.reset();
        System.println("Started Night mode");
    }

    function startNap() {
        mode = :nap;
        capSecs = 1800; // 30 minutes
        state = STATE_DETECTING;
        sleepModel.reset();
        System.println("Started Nap mode");
    }

    function stopTracking() {
        state = STATE_IDLE;
        sleepModel.stop();
        alarm.stop();
        System.println("Stopped tracking");
    }

    function triggerAlarm() {
        state = STATE_ALARM;
        alarm.start();
        System.println("Alarm triggered!");
    }

    function snooze() {
        alarm.snooze(method(:onSnoozeComplete));
        state = STATE_SLEEPING; // Back to sleep during snooze
    }

    function onSnoozeComplete() {
        if (state == STATE_SLEEPING) {
            triggerAlarm();
        }
    }

    function extend15() {
        if (mode == :night) {
            targetSecs += 900; // +15 minutes
        } else {
            capSecs += 900;
        }
        state = STATE_SLEEPING;
        alarm.stop();
        System.println("Extended 15 minutes");
    }

    function getStateString() {
        if (state == STATE_IDLE) {
            return "Idle";
        } else if (state == STATE_DETECTING) {
            return "Detecting onset...";
        } else if (state == STATE_SLEEPING) {
            return "Sleeping";
        } else {
            return "ALARM";
        }
    }

    function getElapsedString() {
        var secs = sleepModel.getElapsedSleep();
        var hours = secs / 3600;
        var mins = (secs % 3600) / 60;
        return hours.format("%02d") + "h " + mins.format("%02d") + "m";
    }

    function getTargetString() {
        var secs = (mode == :night) ? targetSecs : capSecs;
        var hours = secs / 3600;
        var mins = (secs % 3600) / 60;
        return hours.format("%02d") + "h " + mins.format("%02d") + "m";
    }
}
