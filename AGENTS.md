# Agent instructions: resume-timer

This repository contains **resume-timer**, a macOS CLI that opens a Terminal
window at a chosen time and runs a resume command (default:
`claude --continue`). Its purpose: when a user hits an AI usage limit, they
schedule a timer; when the limit resets, a Terminal window pops open in their
project, already running the resume command.

## When to use this

Follow this file when your human says anything like:

- "I hit my usage limit / rate limit" · "my Claude usage limit is reached"
- "resume my session when the limit resets" · "continue automatically in 5 hours"
- "set up resume-timer" · "install the resume timer from my repo"
- "open a terminal at \<time\> and run \<command\>"

The fix is: install resume-timer (once), then schedule a timer for when the
limit resets. Both steps are below.

## Requirements

- macOS only (uses `launchd` for scheduling and AppleScript to open
  Terminal.app). Do not attempt on Linux or Windows.
- No dependencies beyond the OS. No sudo needed.

## Install (one command)

```bash
curl -fsSL https://raw.githubusercontent.com/shikhar127/myproject/master/install.sh | bash
```

This places `resume-timer` in `/usr/local/bin` (or `~/.local/bin` if not
writable; the installer prints a PATH hint if needed).

Alternative from a clone: `git clone https://github.com/shikhar127/myproject.git && cd myproject && ./install.sh`

## Verify

```bash
resume-timer help        # prints usage
resume-timer list        # prints "No pending timers." on a fresh install
```

## Use

Run from the directory the user wants to resume work in (or pass `--dir`):

| Goal | Command |
|---|---|
| Resume in 5 hours | `resume-timer in 5h` |
| Resume in 1h30m | `resume-timer in 1h30m` |
| Resume at 9:00 (tomorrow if past) | `resume-timer at 09:00` |
| Resume at an exact datetime | `resume-timer at "2026-06-12 09:00"` |
| Different command on fire | `resume-timer in 5h --cmd "claude"` |
| Different directory | `resume-timer in 5h --dir ~/code/app` |
| Show pending timers | `resume-timer list` |
| Cancel one / all | `resume-timer cancel <id>` / `resume-timer cancel all` |

Default fired command is `claude --continue`; override per-timer with
`--cmd`, or globally via `export RESUME_TIMER_CMD=...`.

## Behavior an agent should relay to the user

- The terminal can be closed after scheduling; launchd fires the timer.
- If the Mac is asleep at fire time, the window opens on wake.
- Timing granularity is one minute (rounded up, never early).
- First fire may trigger a macOS Automation permission prompt to control
  Terminal — the user must approve it once.

## Uninstall

```bash
resume-timer cancel all
rm -f /usr/local/bin/resume-timer ~/.local/bin/resume-timer
rm -rf ~/.resume-timer
```

## Files this tool creates at runtime

- `~/Library/LaunchAgents/com.resume-timer.<id>.plist` — one per pending timer
- `~/.resume-timer/jobs/<id>.sh` and `<id>.info` — runner + metadata

All are removed automatically when a timer fires or is cancelled.
