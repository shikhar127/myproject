#!/usr/bin/env bash
# Publishes resume-timer to its own dedicated public repo: shikhar127/resume-timer.
#
# Run on your Mac:
#   curl -fsSL https://raw.githubusercontent.com/shikhar127/myproject/master/publish-resume-timer.sh | bash
# or from a clone of myproject:
#   ./publish-resume-timer.sh
#
# With the GitHub CLI (gh) installed and authenticated, this is fully automatic:
# it creates the repo, pushes the contents, sets description + topics, and cuts
# a v1.0.0 release. Without gh, it walks you through creating the repo in the
# browser (30 seconds) and pushes with plain git.
set -euo pipefail

OWNER="shikhar127"
REPO="resume-timer"
DESC="Auto-resume your Claude/AI session when a usage limit resets — macOS CLI that reopens Terminal on schedule and runs your resume command (default: claude --continue)"
TOPICS=(claude claude-code usage-limit rate-limit auto-resume macos launchd terminal cli ai-agents)

HAVE_GH=0
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  HAVE_GH=1
else
  echo "GitHub CLI (gh) not available or not authenticated — continuing with plain git."
  echo
  echo "If https://github.com/$OWNER/$REPO does not exist yet, create it now (30 seconds):"
  echo "  1. open  https://github.com/new"
  echo "  2. name: $REPO   visibility: Public   (do NOT add a README)"
  echo "  3. click 'Create repository'"
  echo
  # /dev/tty so this works when the script is piped from curl
  read -r -p "Press Enter once the repo exists (Ctrl-C to abort)... " < /dev/tty
fi

# locate dist/resume-timer next to this script, or fetch the repo if piped from curl
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
src_dir="$script_dir/dist/resume-timer"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
if [[ ! -f "$src_dir/resume-timer.sh" ]]; then
  echo "Fetching source from github.com/$OWNER/myproject ..."
  git clone --quiet --depth 1 "https://github.com/$OWNER/myproject.git" "$work/myproject"
  src_dir="$work/myproject/dist/resume-timer"
fi
[[ -f "$src_dir/resume-timer.sh" ]] || { echo "error: dist/resume-timer is missing or incomplete" >&2; exit 1; }

if (( HAVE_GH )); then
  if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
    echo "Repo $OWNER/$REPO already exists — updating contents."
  else
    gh repo create "$OWNER/$REPO" --public --description "$DESC"
    echo "Created repo $OWNER/$REPO"
  fi
fi

stage="$work/stage"
mkdir -p "$stage"
cp -R "$src_dir/." "$stage/"
cd "$stage"
git init --quiet --initial-branch=main
git add -A
git commit --quiet -m "resume-timer v1.0.0: auto-resume your AI session when a usage limit resets" ||
  git -c user.name="$OWNER" -c user.email="$OWNER@users.noreply.github.com" \
    commit --quiet -m "resume-timer v1.0.0: auto-resume your AI session when a usage limit resets"

# push over https; fall back to ssh if that auth path isn't set up
git remote add origin "https://github.com/$OWNER/$REPO.git"
if ! git push -u origin main --force; then
  echo "https push failed — trying ssh ..."
  git remote set-url origin "git@github.com:$OWNER/$REPO.git"
  git push -u origin main --force
fi

if (( HAVE_GH )); then
  topic_args=(); for t in "${TOPICS[@]}"; do topic_args+=(--add-topic "$t"); done
  gh repo edit "$OWNER/$REPO" --description "$DESC" "${topic_args[@]}"
  gh release view v1.0.0 --repo "$OWNER/$REPO" >/dev/null 2>&1 ||
    gh release create v1.0.0 --repo "$OWNER/$REPO" --title "v1.0.0" \
      --notes "First release. Install: \`curl -fsSL https://raw.githubusercontent.com/$OWNER/$REPO/main/install.sh | bash\`"
else
  echo
  echo "Pushed. Two quick manual steps to finish search optimization:"
  echo "  1. https://github.com/$OWNER/$REPO → About (⚙️) → add description:"
  echo "       $DESC"
  echo "     and topics: ${TOPICS[*]}"
  echo "  2. (optional) https://github.com/$OWNER/$REPO/releases/new → tag v1.0.0"
fi

echo
echo "Published: https://github.com/$OWNER/$REPO"
echo "Install command now live:"
echo "  curl -fsSL https://raw.githubusercontent.com/$OWNER/$REPO/main/install.sh | bash"
