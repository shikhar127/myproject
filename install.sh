#!/usr/bin/env bash
# Installs resume-timer as a global command. Run: ./install.sh
set -euo pipefail

src="$(cd "$(dirname "$0")" && pwd)/resume-timer.sh"
[[ -f "$src" ]] || { echo "error: resume-timer.sh not found next to install.sh" >&2; exit 1; }

dest_dir="/usr/local/bin"
if [[ ! -d "$dest_dir" || ! -w "$dest_dir" ]]; then
  dest_dir="$HOME/.local/bin"
  mkdir -p "$dest_dir"
fi

install -m 0755 "$src" "$dest_dir/resume-timer"
echo "Installed: $dest_dir/resume-timer"

if ! command -v resume-timer >/dev/null 2>&1; then
  shell_rc="$HOME/.zshrc"
  echo
  echo "NOTE: $dest_dir is not on your PATH. Add it with:"
  echo "  echo 'export PATH=\"$dest_dir:\$PATH\"' >> $shell_rc && source $shell_rc"
fi

echo
echo "Try: resume-timer in 5h"
