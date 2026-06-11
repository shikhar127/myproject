#!/usr/bin/env bash
#
# resume-timer — pop open a macOS Terminal window at a chosen time and run a
# resume command (default: `claude --continue`). Built for picking work back
# up the moment a usage limit resets.
#
# Scheduling is done with launchd, so you can close the terminal afterwards
# and the timer still fires — even if the Mac sleeps in between (it fires on
# wake). Timing granularity is one minute.
#
# Usage:
#   resume-timer in <duration>  [--cmd CMD] [--dir PATH]   e.g. in 5h, in 1h30m, in 90m
#   resume-timer at <time>      [--cmd CMD] [--dir PATH]   e.g. at 14:30, at "2026-06-12 09:00"
#   resume-timer list                                      show pending timers
#   resume-timer cancel <id|all>                           cancel a timer
#   resume-timer help
#
# Options:
#   --cmd CMD   command to run in the new Terminal window (default: claude --continue,
#               or $RESUME_TIMER_CMD if set)
#   --dir PATH  directory the window opens in (default: current directory)
#
# Examples:
#   resume-timer in 5h                         # 5 hours from now, resume here
#   resume-timer at 09:00 --dir ~/code/app     # 9am (tomorrow if past), in that repo
#   resume-timer in 3h --cmd "claude"          # start a fresh session instead

set -euo pipefail

APP_DIR="$HOME/.resume-timer"
JOBS_DIR="$APP_DIR/jobs"
AGENTS_DIR="$HOME/Library/LaunchAgents"
LABEL_PREFIX="com.resume-timer"
DEFAULT_CMD="${RESUME_TIMER_CMD:-claude --continue}"

usage() {
  sed -n '3,26p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

err() { echo "error: $*" >&2; exit 1; }

# ---- duration like 5h, 90m, 1h30m, 45s, or plain seconds --------------------
parse_duration() {
  local input="$1" total=0 num unit rest="$1"
  [[ "$input" =~ ^[0-9]+$ ]] && { echo "$input"; return; }
  [[ "$input" =~ ^([0-9]+[hms])+$ ]] ||
    err "invalid duration '$input' (use forms like 5h, 90m, 1h30m, 45s)"
  while [[ -n "$rest" ]]; do
    num="${rest%%[hms]*}"
    unit="${rest:${#num}:1}"
    rest="${rest:${#num}+1}"
    case "$unit" in
      h) total=$((total + num * 3600)) ;;
      m) total=$((total + num * 60)) ;;
      s) total=$((total + num)) ;;
    esac
  done
  echo "$total"
}

# ---- absolute time: HH:MM (rolls to tomorrow if past) or "YYYY-MM-DD HH:MM" --
seconds_until_at() {
  local at="$1" target now today
  now=$(date +%s)
  if [[ "$at" =~ ^[0-9]{1,2}:[0-9]{2}$ ]]; then
    today=$(date +%Y-%m-%d)
    target=$(date -j -f "%Y-%m-%d %H:%M" "$today $at" +%s 2>/dev/null) ||
      err "invalid time '$at'"
    if (( target <= now )); then
      target=$(date -v+1d -j -f "%Y-%m-%d %H:%M" "$today $at" +%s)
    fi
  elif [[ "$at" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}\ [0-9]{1,2}:[0-9]{2}$ ]]; then
    target=$(date -j -f "%Y-%m-%d %H:%M" "$at" +%s 2>/dev/null) ||
      err "invalid datetime '$at'"
  else
    err "'at' expects HH:MM or \"YYYY-MM-DD HH:MM\""
  fi
  (( target > now )) || err "target time is in the past"
  echo $(( target - now ))
}

# escape backslashes and double quotes for embedding in an AppleScript string
esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

schedule() {
  local delay="$1" work_dir="$2" resume_cmd="$3"
  local now target id label runner plist info fire_human
  now=$(date +%s)
  target=$(( now + delay ))
  # launchd calendar jobs are minute-granular; round up so we never fire early
  target=$(( (target + 59) / 60 * 60 ))

  local mo dd hh mi
  mo=$((10#$(date -r "$target" +%m)))
  dd=$((10#$(date -r "$target" +%d)))
  hh=$((10#$(date -r "$target" +%H)))
  mi=$((10#$(date -r "$target" +%M)))
  fire_human=$(date -r "$target" "+%a %Y-%m-%d %H:%M")

  id="$(date +%y%m%d%H%M%S)$RANDOM"
  label="$LABEL_PREFIX.$id"
  runner="$JOBS_DIR/$id.sh"
  plist="$AGENTS_DIR/$label.plist"
  info="$JOBS_DIR/$id.info"

  mkdir -p "$JOBS_DIR" "$AGENTS_DIR"

  local as_cmd
  # \\\" yields a literal \" so the AppleScript string keeps its escaped quotes
  as_cmd="cd \\\"$(esc "$work_dir")\\\" && $(esc "$resume_cmd")"

  cat > "$runner" <<RUNNER
#!/bin/bash
# one-shot resume-timer job $id — opens Terminal, then cleans itself up
/usr/bin/osascript <<'APPLESCRIPT'
tell application "Terminal"
    do script "$as_cmd"
    activate
end tell
APPLESCRIPT
rm -f "$info" "$runner" "$plist"
/bin/launchctl bootout "gui/\$(id -u)/$label" 2>/dev/null || true
RUNNER
  chmod +x "$runner"

  cat > "$plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$label</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$runner</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Month</key><integer>$mo</integer>
        <key>Day</key><integer>$dd</integer>
        <key>Hour</key><integer>$hh</integer>
        <key>Minute</key><integer>$mi</integer>
    </dict>
</dict>
</plist>
PLIST

  printf '%s|%s|%s|%s\n' "$id" "$fire_human" "$work_dir" "$resume_cmd" > "$info"

  if ! launchctl bootstrap "gui/$(id -u)" "$plist" 2>/dev/null; then
    launchctl load "$plist" 2>/dev/null ||
      { rm -f "$runner" "$plist" "$info"; err "failed to register launchd job"; }
  fi

  echo "Timer set (id: $id)"
  echo "  fires    : $fire_human"
  echo "  directory: $work_dir"
  echo "  command  : $resume_cmd"
  echo
  echo "You can close this terminal — the window will open on its own."
  echo "Manage with: resume-timer list | resume-timer cancel $id"
}

list_jobs() {
  shopt -s nullglob
  local files=("$JOBS_DIR"/*.info) f id when dir cmd
  if (( ${#files[@]} == 0 )); then
    echo "No pending timers."
    return
  fi
  printf '%-18s %-22s %s\n' "ID" "FIRES" "COMMAND (DIRECTORY)"
  for f in "${files[@]}"; do
    IFS='|' read -r id when dir cmd < "$f"
    printf '%-18s %-22s %s  (%s)\n' "$id" "$when" "$cmd" "$dir"
  done
}

cancel_job() {
  local id="$1" label plist
  label="$LABEL_PREFIX.$id"
  plist="$AGENTS_DIR/$label.plist"
  [[ -f "$JOBS_DIR/$id.info" || -f "$plist" ]] || err "no timer with id '$id' (try: resume-timer list)"
  launchctl bootout "gui/$(id -u)/$label" 2>/dev/null ||
    launchctl unload "$plist" 2>/dev/null || true
  rm -f "$plist" "$JOBS_DIR/$id.sh" "$JOBS_DIR/$id.info"
  echo "Cancelled timer $id."
}

cancel_all() {
  shopt -s nullglob
  local files=("$JOBS_DIR"/*.info) f id
  (( ${#files[@]} > 0 )) || { echo "No pending timers."; return; }
  for f in "${files[@]}"; do
    id=$(basename "$f" .info)
    cancel_job "$id"
  done
}

# ---- main --------------------------------------------------------------------
action="${1:-help}"
shift || true

case "$action" in
  in|--in|at|--at)
    [[ $# -ge 1 ]] || err "'$action' needs a value (e.g. resume-timer in 5h)"
    spec="$1"; shift
    work_dir="$PWD"
    resume_cmd="$DEFAULT_CMD"
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --cmd) [[ $# -ge 2 ]] || err "--cmd needs a value"; resume_cmd="$2"; shift 2 ;;
        --dir) [[ $# -ge 2 ]] || err "--dir needs a value"; work_dir="$2"; shift 2 ;;
        *) err "unknown option '$1'" ;;
      esac
    done
    work_dir="${work_dir/#\~/$HOME}"
    [[ -d "$work_dir" ]] || err "directory not found: $work_dir"
    case "$action" in
      in|--in) delay=$(parse_duration "$spec") ;;
      at|--at) delay=$(seconds_until_at "$spec") ;;
    esac
    schedule "$delay" "$work_dir" "$resume_cmd"
    ;;
  list|ls)
    list_jobs
    ;;
  cancel|rm)
    [[ $# -ge 1 ]] || err "'cancel' needs a timer id or 'all' (see: resume-timer list)"
    if [[ "$1" == "all" ]]; then cancel_all; else cancel_job "$1"; fi
    ;;
  help|-h|--help)
    usage 0
    ;;
  *)
    echo "error: unknown command '$action'" >&2
    usage 1
    ;;
esac
