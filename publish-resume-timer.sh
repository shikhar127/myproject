#!/usr/bin/env bash
# Publishes resume-timer to its own dedicated public repo: shikhar127/resume-timer.
#
# Run on your Mac (needs the GitHub CLI, authenticated: `gh auth login`):
#   curl -fsSL https://raw.githubusercontent.com/shikhar127/myproject/master/publish-resume-timer.sh | bash
# or from a clone of myproject:
#   ./publish-resume-timer.sh
#
# What it does:
#   1. creates the public repo shikhar127/resume-timer (skips if it exists)
#   2. pushes the prepared contents of dist/resume-timer/ as the initial commit
#   3. sets the repo description and search topics
#   4. tags v1.0.0 and creates a GitHub release
set -euo pipefail

OWNER="shikhar127"
REPO="resume-timer"
DESC="Auto-resume your Claude/AI session when a usage limit resets — macOS CLI that reopens Terminal on schedule and runs your resume command (default: claude --continue)"
TOPICS=(claude claude-code usage-limit rate-limit auto-resume macos launchd terminal cli ai-agents)

command -v gh >/dev/null || { echo "error: GitHub CLI required — install with 'brew install gh' then 'gh auth login'" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "error: gh is not authenticated — run 'gh auth login'" >&2; exit 1; }

# locate dist/resume-timer next to this script, or fetch the repo if piped from curl
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
src_dir="$script_dir/dist/resume-timer"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
if [[ ! -d "$src_dir" ]]; then
  echo "Fetching source from github.com/$OWNER/myproject ..."
  git clone --quiet --depth 1 "https://github.com/$OWNER/myproject.git" "$work/myproject"
  src_dir="$work/myproject/dist/resume-timer"
fi
[[ -f "$src_dir/resume-timer.sh" ]] || { echo "error: dist/resume-timer is missing or incomplete" >&2; exit 1; }

if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  echo "Repo $OWNER/$REPO already exists — updating contents."
else
  gh repo create "$OWNER/$REPO" --public --description "$DESC"
  echo "Created repo $OWNER/$REPO"
fi

stage="$work/stage"
mkdir -p "$stage"
cp -R "$src_dir/." "$stage/"
cd "$stage"
git init --quiet --initial-branch=main
git add -A
git -c user.name="$OWNER" -c user.email="$OWNER@users.noreply.github.com" \
  commit --quiet -m "resume-timer v1.0.0: auto-resume your AI session when a usage limit resets"
git remote add origin "https://github.com/$OWNER/$REPO.git"
git push -u origin main --force

topic_args=(); for t in "${TOPICS[@]}"; do topic_args+=(--add-topic "$t"); done
gh repo edit "$OWNER/$REPO" --description "$DESC" "${topic_args[@]}"

gh release view v1.0.0 --repo "$OWNER/$REPO" >/dev/null 2>&1 ||
  gh release create v1.0.0 --repo "$OWNER/$REPO" --title "v1.0.0" \
    --notes "First release. Install: \`curl -fsSL https://raw.githubusercontent.com/$OWNER/$REPO/main/install.sh | bash\`"

echo
echo "Published: https://github.com/$OWNER/$REPO"
echo "Install command now live:"
echo "  curl -fsSL https://raw.githubusercontent.com/$OWNER/$REPO/main/install.sh | bash"
