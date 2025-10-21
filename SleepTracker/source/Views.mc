using Toybox.WatchUi as Ui;
using Toybox.Graphics as Gfx;
using Toybox.System;

class SleepTrackerView extends Ui.View {

    function initialize() {
        View.initialize();
    }

    function onUpdate(dc) {
        var app = Application.getApp();

        dc.setColor(Gfx.COLOR_BLACK, Gfx.COLOR_BLACK);
        dc.clear();

        var width = dc.getWidth();
        var height = dc.getHeight();

        dc.setColor(Gfx.COLOR_WHITE, Gfx.COLOR_TRANSPARENT);

        // Top: State
        dc.drawText(width/2, 20, Gfx.FONT_SMALL, app.getStateString(), Gfx.TEXT_JUSTIFY_CENTER);

        // Middle: Time info
        if (app.state == STATE_SLEEPING or app.state == STATE_ALARM) {
            dc.drawText(width/2, height/2 - 40, Gfx.FONT_MEDIUM, "Asleep: " + app.getElapsedString(), Gfx.TEXT_JUSTIFY_CENTER);
            dc.drawText(width/2, height/2 - 10, Gfx.FONT_SMALL, "Target: " + app.getTargetString(), Gfx.TEXT_JUSTIFY_CENTER);
        } else if (app.state == STATE_DETECTING) {
            dc.drawText(width/2, height/2 - 20, Gfx.FONT_MEDIUM, "Waiting for sleep...", Gfx.TEXT_JUSTIFY_CENTER);
        } else {
            dc.drawText(width/2, height/2 - 20, Gfx.FONT_MEDIUM, "Ready", Gfx.TEXT_JUSTIFY_CENTER);
        }

        // Bottom: Button hints
        if (app.state == STATE_IDLE) {
            dc.drawText(width/2, height - 60, Gfx.FONT_TINY, "START: Night (8h)", Gfx.TEXT_JUSTIFY_CENTER);
            dc.drawText(width/2, height - 40, Gfx.FONT_TINY, "UP: Nap (30m)", Gfx.TEXT_JUSTIFY_CENTER);
        } else if (app.state == STATE_ALARM) {
            dc.drawText(width/2, height - 60, Gfx.FONT_TINY, "START: Snooze 5m", Gfx.TEXT_JUSTIFY_CENTER);
            dc.drawText(width/2, height - 40, Gfx.FONT_TINY, "UP: +15m  DOWN: Stop", Gfx.TEXT_JUSTIFY_CENTER);
        } else {
            dc.drawText(width/2, height - 40, Gfx.FONT_TINY, "DOWN: Stop", Gfx.TEXT_JUSTIFY_CENTER);
        }
    }
}

class SleepTrackerDelegate extends Ui.BehaviorDelegate {

    function initialize() {
        BehaviorDelegate.initialize();
    }

    function onKey(keyEvent) {
        var app = Application.getApp();
        var key = keyEvent.getKey();

        if (app.state == STATE_IDLE) {
            if (key == Ui.KEY_ENTER or key == Ui.KEY_START) {
                app.startNight();
                return true;
            } else if (key == Ui.KEY_UP) {
                app.startNap();
                return true;
            }
        } else if (app.state == STATE_ALARM) {
            if (key == Ui.KEY_ENTER or key == Ui.KEY_START) {
                app.snooze();
                return true;
            } else if (key == Ui.KEY_UP) {
                app.extend15();
                return true;
            } else if (key == Ui.KEY_DOWN) {
                app.stopTracking();
                return true;
            }
        } else if (app.state == STATE_DETECTING or app.state == STATE_SLEEPING) {
            if (key == Ui.KEY_DOWN) {
                app.stopTracking();
                return true;
            }
        }

        return false;
    }

    function onTap(clickEvent) {
        // Touchscreen fallback
        var app = Application.getApp();
        var coords = clickEvent.getCoordinates();
        var y = coords[1];
        var height = System.getDeviceSettings().screenHeight;

        if (app.state == STATE_IDLE) {
            if (y < height * 0.5) {
                app.startNight();
            } else {
                app.startNap();
            }
            return true;
        } else if (app.state == STATE_ALARM) {
            if (y < height * 0.33) {
                app.snooze();
            } else if (y < height * 0.66) {
                app.extend15();
            } else {
                app.stopTracking();
            }
            return true;
        } else {
            app.stopTracking();
            return true;
        }
    }
}
