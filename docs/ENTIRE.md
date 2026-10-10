# How PriorProof uses Entire

## Important: what an Entire checkpoint actually is

An Entire checkpoint is a development-time pairing of a coding-agent session with a
git commit. It is not a runtime state snapshot of the deployed app. The checkpoint
captures the agent work that produced a commit, so the record lives in the build
history, not in the running Vercel function.

This matters for how the submission links it. The accessible checkpoint link points
at a build commit:

```
https://entire.io/gh/zkasuran/priorproof/commit/<sha>
```

The checkpoint id is the `Entire-Checkpoint` ULID carried as a trailer in that
commit message. So to cite a checkpoint you cite a commit. The ULID is read off
that commit, not off a live session.

## The build is checkpointed in stages

PriorProof is built in stages so each stage is its own checkpointed commit. The
three natural stages map to the three parts of the agent:

1. chart extraction
2. coverage logic (the two-pass prove-or-refuse engine)
3. packet assembly

Each stage is a commit, each commit carries its own `Entire-Checkpoint` trailer, so
the submission can point a reviewer at the exact commit where a given part of the
agent came to life.

## The CLI sequence a solo builder runs

```bash
# 1. install the CLI
curl -fsSL https://entire.io/install.sh | bash

# 2. log in (opens a browser for OAuth, this is a human step)
entire login

# 3. enable Entire for the coding agent in this repo
entire enable -y --agent claude-code

# 4. build in stages, committing each stage so it is checkpointed:
#      chart extraction  -> commit
#      coverage logic    -> commit
#      packet assembly   -> commit

# 5. read the checkpoints back
entire checkpoint list
entire checkpoint explain <checkpoint-id>
```

`entire checkpoint list` shows the checkpoints paired with commits. `entire
checkpoint explain` describes the agent work behind one of them, which is what you
quote in the submission writeup.

## Graph and Brain (optional)

Entire also offers Graph and Brain. Graph is the relationship view over the
checkpointed history. Brain is the recall layer over past agent work. Both are
optional for PriorProof. The checkpoint link and the staged commits are enough for
the submission. Graph or Brain are a nice-to-have on top, not a dependency.

## Honesty note: resume is an app feature, not an Entire capability

PriorProof can resume a run without re-reading the chart. That is a PriorProof app
feature backed by a local store the app keeps between runs. It is not an Entire
capability and the submission does not claim it as one. Entire checkpoints the
build. The app resumes the run. Keeping those two separate is what keeps the
submission narrative honest.

## Human handoff

Three steps need a human and cannot run headless:

1. `entire login`. Finish the browser OAuth flow when the CLI opens it.
2. Authorize the Entire GitHub App on the `zkasuran` account and grant it the
   `priorproof` repository, so Entire can pair checkpoints with commits.
3. Make the `priorproof` repository public at submission, so the
   `https://entire.io/gh/zkasuran/priorproof/commit/<sha>` link resolves for a
   reviewer who is not signed in.
