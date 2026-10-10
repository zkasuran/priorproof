#!/usr/bin/env bash
# entire-checkpoint.sh - read back the Entire checkpoint for a build commit.
#
# What this does
#   An Entire checkpoint is a development-time pairing of a coding-agent session
#   with a git commit, not a runtime snapshot of the deployed app. Once Entire is
#   enabled in this repo, each commit is paired with a checkpoint whose id is the
#   `Entire-Checkpoint` trailer in that commit message. This helper reads the
#   trailer for a commit, prints the accessible checkpoint link, then asks the
#   Entire CLI to list and explain it. Point the submission at the link it prints.
#
# One-time human OAuth steps (NOT run here, they need a browser):
#   - `entire login`                           sign in via browser OAuth
#   - authorize the Entire GitHub App on the account and grant it this repo
#   - `entire enable -y --agent claude-code`   turn on checkpointing for this repo
#   After those are done once, this script is safe to run headless.
#
# Usage: scripts/entire-checkpoint.sh [commit-sha]   (default: HEAD)

set -euo pipefail

REPO_SLUG="zkasuran/priorproof"
COMMIT="${1:-HEAD}"

# Resolve the argument to a full commit sha.
SHA="$(git rev-parse --verify "${COMMIT}^{commit}")"

# The checkpoint id is a git trailer on the commit, not a separate lookup.
CHECKPOINT_ID="$(git show -s --format='%(trailers:key=Entire-Checkpoint,valueonly=true)' "$SHA" | head -n1 | tr -d '[:space:]')"

echo "commit:      $SHA"
echo "link:        https://entire.io/gh/${REPO_SLUG}/commit/${SHA}"

if [ -z "$CHECKPOINT_ID" ]; then
  echo "checkpoint:  none on this commit" >&2
  echo "             Is 'entire enable' on? Was this commit made after enabling?" >&2
  exit 1
fi
echo "checkpoint:  $CHECKPOINT_ID"

# If the Entire CLI is installed, list the checkpoints and explain this one.
if command -v entire >/dev/null 2>&1; then
  echo
  echo "== entire checkpoint list =="
  entire checkpoint list || true
  echo
  echo "== entire checkpoint explain ${CHECKPOINT_ID} =="
  entire checkpoint explain "$CHECKPOINT_ID"
else
  echo "entire CLI not found on PATH." >&2
  echo "Install: curl -fsSL https://entire.io/install.sh | bash" >&2
  echo "The link and checkpoint id above are still valid for the submission." >&2
fi
