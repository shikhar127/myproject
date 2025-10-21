using Toybox.Sensor;
using Toybox.System;
using Toybox.Time;

class SleepModel {

    const ONSET_QUIET_SECS = 600; // 10 minutes of quiet
    const ACCEL_VARIANCE_THRESHOLD = 50.0; // Adjust based on testing
    const HR_DROP_BPM = 8;
    const HR_ABSOLUTE_THRESHOLD = 65;
    const GENTLE_WAKE_MULTIPLIER = 1.35;

    var hrBaseline = null;
    var quietStartTime = null;
    var sleepStartTime = null;
    var isSleepingFlag = false;

    var accelHistory = []; // Last N variance values
    var recentVariances = []; // Last 2 minutes for gentle wake
    var olderVariances = []; // Prior 5 minutes for gentle wake

    var lastHeartRate = null;

    function initialize() {
        // Enable sensors
        Sensor.setEnabledSensors([Sensor.SENSOR_HEARTRATE]);
        Sensor.enableSensorEvents(method(:onSensor));
    }

    function reset() {
        hrBaseline = null;
        quietStartTime = null;
        sleepStartTime = null;
        isSleepingFlag = false;
        accelHistory = [];
        recentVariances = [];
        olderVariances = [];
        lastHeartRate = null;
    }

    function stop() {
        Sensor.setEnabledSensors([]);
        Sensor.enableSensorEvents(null);
    }

    function onSensor(sensorInfo) {
        if (sensorInfo has :heartRate and sensorInfo.heartRate != null) {
            lastHeartRate = sensorInfo.heartRate;

            // Establish baseline from first few readings
            if (hrBaseline == null) {
                hrBaseline = lastHeartRate;
            }
        }
    }

    function update() {
        // Get accelerometer variance
        var variance = getAccelVariance();

        // Store for gentle wake detection
        if (variance != null) {
            recentVariances.add(variance);
            if (recentVariances.size() > 24) { // 2 minutes at 5s ticks
                var old = recentVariances[0];
                recentVariances = recentVariances.slice(1, null);
                olderVariances.add(old);
                if (olderVariances.size() > 60) { // 5 minutes
                    olderVariances = olderVariances.slice(1, null);
                }
            }
        }

        // Check for sleep onset
        if (!isSleepingFlag) {
            var isQuiet = variance != null and variance < ACCEL_VARIANCE_THRESHOLD;
            var hrLow = false;

            if (lastHeartRate != null) {
                if (hrBaseline != null) {
                    hrLow = (lastHeartRate <= hrBaseline - HR_DROP_BPM);
                } else {
                    hrLow = (lastHeartRate <= HR_ABSOLUTE_THRESHOLD);
                }
            }

            if (isQuiet and hrLow) {
                if (quietStartTime == null) {
                    quietStartTime = Time.now();
                } else {
                    var quietDuration = Time.now().value() - quietStartTime.value();
                    if (quietDuration >= ONSET_QUIET_SECS) {
                        isSleepingFlag = true;
                    }
                }
            } else {
                quietStartTime = null;
            }
        }
    }

    function getAccelVariance() {
        var accelInfo = Sensor.getInfo();
        if (accelInfo has :accel and accelInfo.accel != null) {
            var x = accelInfo.accel[0];
            var y = accelInfo.accel[1];
            var z = accelInfo.accel[2];

            // Simple magnitude
            var mag = Math.sqrt(x*x + y*y + z*z);

            accelHistory.add(mag);
            if (accelHistory.size() > 10) {
                accelHistory = accelHistory.slice(1, null);
            }

            // Compute variance
            if (accelHistory.size() >= 5) {
                var sum = 0.0;
                for (var i = 0; i < accelHistory.size(); i++) {
                    sum += accelHistory[i];
                }
                var mean = sum / accelHistory.size();

                var varSum = 0.0;
                for (var i = 0; i < accelHistory.size(); i++) {
                    var diff = accelHistory[i] - mean;
                    varSum += diff * diff;
                }
                return varSum / accelHistory.size();
            }
        }
        return null;
    }

    function isSleeping() {
        return isSleepingFlag;
    }

    function markSleepStart() {
        sleepStartTime = Time.now();
    }

    function getElapsedSleep() {
        if (sleepStartTime == null) {
            return 0;
        }
        return Time.now().value() - sleepStartTime.value();
    }

    function isGentleWake() {
        // Compare recent 2-min variance to older 5-min variance
        if (recentVariances.size() < 10 or olderVariances.size() < 10) {
            return false;
        }

        var recentAvg = avg(recentVariances);
        var olderAvg = avg(olderVariances);

        if (olderAvg > 0 and recentAvg >= olderAvg * GENTLE_WAKE_MULTIPLIER) {
            return true;
        }
        return false;
    }

    function avg(arr) {
        var sum = 0.0;
        for (var i = 0; i < arr.size(); i++) {
            sum += arr[i];
        }
        return sum / arr.size();
    }
}
