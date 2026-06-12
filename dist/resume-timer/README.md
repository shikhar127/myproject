# resume-timer

**Auto-resume Claude Code (or any AI coding session) when your usage limit resets.**

You hit a **Claude usage limit** mid-task. Instead of watching the clock, run
one command — and when the limit resets, a macOS Terminal window pops open in
your project, already running `claude --continue`. Works with any CLI tool:
Codex, Gemini CLI, Cursor, or your own scripts.

```bash
# install once (macOS, no sudo, no dependencies)
curl -fsSL https://raw.githubusercontent.com/shikhar127/resume-timer/main/install.sh | bash

# when you hit your limit, from your project directory:
resume-timer in 5h
```

That's it. Close the terminal, walk away, let the Mac sleep — the window
still opens on time (scheduling is done by launchd, macOS's native scheduler).

🤖 **AI agents**: follow [AGENTS.md](AGENTS.md) for exact install/verify/use
steps. Machine-readable summary: [llms.txt](llms.txt).

## Usage

| Goal | Command |
|---|---|
| Resume in 5 hours (typical limit reset) | `resume-timer in 5h` |
| Resume in 1 hour 30 minutes | `resume-timer in 1h30m` |
| Resume at 9:00 (tomorrow if already past) | `resume-timer at 09:00` |
| Resume at an exact date and time | `resume-timer at "2026-06-12 09:00"` |
| Run a different command when it fires | `resume-timer in 5h --cmd "codex resume"` |
| Open in a different project directory | `resume-timer in 5h --dir ~/code/app` |
| Show pending timers | `resume-timer list` |
| Cancel one / all timers | `resume-timer cancel <id>` / `resume-timer cancel all` |

The default fired command is `claude --continue` (resumes your most recent
Claude Code session). Change it per-timer with `--cmd`, or permanently:

```bash
echo 'export RESUME_TIMER_CMD="claude --continue"' >> ~/.zshrc
```

## FAQ

### How do I automatically resume Claude Code after hitting the usage limit?

Install resume-timer (one command above), then run `resume-timer in 5h`
(or `resume-timer at <time>` if you know when your limit resets). A Terminal
window opens at that time in your current directory and runs
`claude --continue`.

### Does it work if I close the terminal or my Mac goes to sleep?

Yes. Timers are one-shot launchd agents, not a foreground `sleep`. You can
close the terminal immediately. If the Mac is asleep at fire time, the
window opens as soon as it wakes. Timers also survive logout/login.

### Can I use it with tools other than Claude Code?

Yes — it just opens a Terminal window and runs a command. Examples:
`--cmd "codex resume"`, `--cmd "gemini"`, `--cmd "npm run dev"`, or any
shell command.

### Is it safe to curl | bash?

The whole tool is ~250 lines of plain, auditable bash —
[resume-timer.sh](resume-timer.sh) and [install.sh](install.sh). No sudo,
no dependencies, no network access at runtime. It writes only to
`~/.resume-timer/`, `~/Library/LaunchAgents/`, and the install location.

### Why does macOS ask for permission the first time a timer fires?

The timer uses AppleScript to open Terminal, which requires a one-time
Automation permission. Approve it once and every future timer fires silently.

### What's the timing precision?

One minute (launchd's calendar granularity). Delays are rounded **up**, so a
timer never fires before your limit has reset.

## How it works

`resume-timer in 5h` writes two small files:

1. `~/Library/LaunchAgents/com.resume-timer.<id>.plist` — a one-shot launchd
   agent with a `StartCalendarInterval` for the target minute.
2. `~/.resume-timer/jobs/<id>.sh` — a runner that AppleScripts Terminal to
   open, `cd` into your directory, and run your resume command — then deletes
   both files and unloads the job.

`resume-timer cancel` unloads the agent and removes both files. Nothing else
touches your system.

## Uninstall

```bash
resume-timer cancel all
rm -f /usr/local/bin/resume-timer ~/.local/bin/resume-timer
rm -rf ~/.resume-timer
```

## Requirements

- macOS (uses launchd and Terminal.app). Linux/Windows are not supported.

## License

[MIT](LICENSE)
