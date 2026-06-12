#!/usr/bin/env bash
# resume-timer installer.
#
# Works two ways:
#   1. From a clone:        ./install.sh
#   2. Piped from the web:  curl -fsSL https://raw.githubusercontent.com/shikhar127/myproject/master/install.sh | bash
#
# Env overrides (mainly for testing):
#   RESUME_TIMER_RAW_BASE  base URL to fetch resume-timer.sh from
#   RESUME_TIMER_FORCE=1   skip the macOS check
set -euo pipefail

RAW_BASE="${RESUME_TIMER_RAW_BASE:-https://raw.githubusercontent.com/shikhar127/myproject/master}"

if [[ "$(uname -s)" != "Darwin" && -z "${RESUME_TIMER_FORCE:-}" ]]; then
  echo "error: resume-timer targets macOS (it uses launchd and Terminal.app)." >&2
  exit 1
fi

# Use the script sitting next to this installer if we're in a clone;
# otherwise download it from the repo.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
cleanup() { [[ -n "${tmp:-}" ]] && rm -rf "$tmp"; }
trap cleanup EXIT
if [[ -n "$script_dir" && -f "$script_dir/resume-timer.sh" ]]; then
  src="$script_dir/resume-timer.sh"
else
  tmp="$(mktemp -d)"
  echo "Downloading resume-timer.sh from $RAW_BASE ..."
  curl -fsSL "$RAW_BASE/resume-timer.sh" -o "$tmp/resume-timer.sh"
  src="$tmp/resume-timer.sh"
fi

dest_dir="/usr/local/bin"
if [[ ! -d "$dest_dir" || ! -w "$dest_dir" ]]; then
  dest_dir="$HOME/.local/bin"
  mkdir -p "$dest_dir"
fi

install -m 0755 "$src" "$dest_dir/resume-timer"
echo "Installed: $dest_dir/resume-timer"

"$dest_dir/resume-timer" help >/dev/null
echo "Verified: 'resume-timer help' runs."

case ":$PATH:" in
  *":$dest_dir:"*) ;;
  *)
    echo
    echo "NOTE: $dest_dir is not on your PATH. Add it with:"
    echo "  echo 'export PATH=\"$dest_dir:\$PATH\"' >> ~/.zshrc && source ~/.zshrc"
    ;;
esac

echo
echo "Try: resume-timer in 5h"
