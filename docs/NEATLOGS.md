# How PriorProof uses neatlogs

Every run emits a trace. The trace records the shape of the agent as it works: the
policy parse, each criterion, both independent evidence passes, the cited span or
the gap, then the final packet. A reviewer can open the trace and watch the
prove-or-refuse logic run.

## Dual-write

The trace integration always writes two places:

- the local store, every run, so the app renders the trace with no key set
- neatlogs, when `NEATLOGS_API_KEY` is set in the environment

So the demo always shows a live trace. Setting the key adds the hosted view on top,
it never gates the local one. When the key is absent the neatlogs write is skipped
and nothing breaks.

## Where traces appear

With the key set, traces appear in the project at https://app.neatlogs.com. The
local trace renders in the PriorProof app itself.

## Cost

neatlogs is free during the hackathon.

## Human handoff

1. Sign up at https://app.neatlogs.com.
2. Create a project.
3. Set `NEATLOGS_API_KEY` as a Vercel environment variable, then redeploy.

Without the key the app still runs and still shows the local trace. The key only
turns on the hosted neatlogs view.
