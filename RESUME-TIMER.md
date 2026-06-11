# resume-timer

A tiny macOS CLI that opens a Terminal window at a chosen time and runs a
resume command for you — so when your Claude (or any tool's) usage limit
resets, a fresh window pops up ready to continue where you left off.

Timers are scheduled with **launchd**, macOS's native scheduler. That means:

- You can **close the terminal** after setting a timer — it still fires.
- If your Mac is **asleep** at fire time, the window opens as soon as it wakes.
- Timers survive logout/login (they live in `~/Library/LaunchAgents`).

Timing granularity is one minute.

## Install

```bash
git clone https://github.com/shikhar127/myproject.git
cd myproject
./install.sh        # puts `resume-timer` on your PATH
```

(Or just run `./resume-timer.sh ...` directly without installing.)

## Usage

```bash
# When you hit your usage limit, from your project directory:
resume-timer in 5h                  # Terminal pops open here in 5 hours
resume-timer in 1h30m               # durations: 5h, 90m, 1h30m, 45s
resume-timer at 14:30               # at 2:30pm (tomorrow if already past)
resume-timer at "2026-06-12 09:00"  # a specific date and time

# What it runs / where (defaults: current dir, `claude --continue`):
resume-timer in 5h --cmd "claude"            # start a fresh session instead
resume-timer in 5h --dir ~/code/my-app       # open in a different repo

# Manage pending timers:
resume-timer list
resume-timer cancel <id>
resume-timer cancel all
```

Set a different default command once via your shell config:

```bash
export RESUME_TIMER_CMD="claude --continue"   # in ~/.zshrc
```

## First run

The first time a timer fires, macOS may ask for permission to control
Terminal (Automation permission). Approve it once and you're set.

## How it works

`resume-timer in 5h` writes a one-shot job:

1. a launchd plist in `~/Library/LaunchAgents/com.resume-timer.<id>.plist`
   with a `StartCalendarInterval` for the target minute, and
2. a small runner script in `~/.resume-timer/jobs/` that uses AppleScript to
   open Terminal, `cd` into your directory, and run the resume command —
   then deletes itself and unloads the job.

`cancel` unloads the job and removes both files.
