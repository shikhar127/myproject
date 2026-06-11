#!/usr/bin/env bash
#
# resume-timer.sh — open a macOS Terminal window after a delay and run a
# resume command. Handy for picking work back up once a usage limit resets.
#
# Examples:
#   ./resume-timer.sh --in 5h                  # fire 5 hours from now
#   ./resume-timer.sh --in 1h30m               # 1 hour 30 minutes from now
#   ./resume-timer.sh --at 14:30               # fire at 2:30pm (today, or tomorrow if past)
#   ./resume-timer.sh --in 5h --cmd "claude"   # run a custom command on open
#   ./resume-timer.sh --at 09:00 --dir ~/code/app
#
# Defaults: opens Terminal in the current directory and runs `claude --continue`.

set -euo pipefail

# ---- defaults ---------------------------------------------------------------
RESUME_CMD="claude --continue"
WORK_DIR="$PWD"
DELAY_SECS=""
AT_TIME=""

usage() {
  sed -n '3,13p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

# ---- parse duration like 1h30m, 90m, 45s, 2h ---------------------------------
parse_duration() {
  local input="$1" total=0 num unit rest="$1"
  if [[ ! "$input" =~ ^([0-9]+[hms])+$ && ! "$input" =~ ^[0-9]+$ ]]; then
    echo "error: invalid duration '$input' (use forms like 5h, 90m, 1h30m, 45s, or plain seconds)" >&2
    exit 1
  fi
  # plain number = seconds
  if [[ "$input" =~ ^[0-9]+$ ]]; then
    echo "$input"; return
  fi
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

# ---- parse absolute clock time (HH:MM or "YYYY-MM-DD HH:MM") -----------------
seconds_until_at() {
  local at="$1" target now
  now=$(date +%s)
  if [[ "$at" =~ ^[0-9]{1,2}:[0-9]{2}$ ]]; then
    local today
    today=$(date +%Y-%m-%d)
    target=$(date -j -f "%Y-%m-%d %H:%M" "$today $at" +%s 2>/dev/null) || {
      echo "error: invalid time '$at'" >&2; exit 1; }
    # if the time already passed today, roll to tomorrow
    if (( target <= now )); then
      target=$(date -v+1d -j -f "%Y-%m-%d %H:%M" "$today $at" +%s)
    fi
  elif [[ "$at" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}\ [0-9]{1,2}:[0-9]{2}$ ]]; then
    target=$(date -j -f "%Y-%m-%d %H:%M" "$at" +%s 2>/dev/null) || {
      echo "error: invalid datetime '$at'" >&2; exit 1; }
  else
    echo "error: --at expects HH:MM or \"YYYY-MM-DD HH:MM\"" >&2
    exit 1
  fi
  echo $(( target - now ))
}

# ---- parse args -------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --in)   DELAY_SECS=$(parse_duration "$2"); shift 2 ;;
    --at)   AT_TIME="$2"; shift 2 ;;
    --cmd)  RESUME_CMD="$2"; shift 2 ;;
    --dir)  WORK_DIR="$2"; shift 2 ;;
    -h|--help) usage 0 ;;
    *) echo "error: unknown option '$1'" >&2; usage 1 ;;
  esac
done

# require exactly one timing source
if [[ -n "$DELAY_SECS" && -n "$AT_TIME" ]]; then
  echo "error: use only one of --in or --at" >&2; exit 1
fi
if [[ -z "$DELAY_SECS" && -z "$AT_TIME" ]]; then
  echo "error: specify --in <duration> or --at <time>" >&2; usage 1
fi
if [[ -n "$AT_TIME" ]]; then
  DELAY_SECS=$(seconds_until_at "$AT_TIME")
fi
if (( DELAY_SECS < 0 )); then
  echo "error: target time is in the past" >&2; exit 1
fi

# expand ~ in WORK_DIR
WORK_DIR="${WORK_DIR/#\~/$HOME}"

fire_at=$(date -v+"${DELAY_SECS}"S "+%Y-%m-%d %H:%M:%S" 2>/dev/null || date "+%Y-%m-%d %H:%M:%S")
echo "Resume timer set."
echo "  fires at : $fire_at  (in ${DELAY_SECS}s)"
echo "  directory: $WORK_DIR"
echo "  command  : $RESUME_CMD"
echo "Leave this window open. Ctrl-C to cancel."

sleep "$DELAY_SECS"

# Escape double quotes and backslashes for safe embedding in AppleScript.
esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
full_cmd="cd \"$(esc "$WORK_DIR")\" && $(esc "$RESUME_CMD")"

osascript \
  -e "tell application \"Terminal\" to do script \"$full_cmd\"" \
  -e 'tell application "Terminal" to activate'

echo "Terminal launched at $(date "+%H:%M:%S")."
