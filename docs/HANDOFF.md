# PriorProof human handoff

These are the steps a tool cannot run headless. Each one needs a human in a browser
or a one-time sign-in. Everything else in the build is automated. No secret values
appear in this file: it names the variables to set, never their contents.

## 1. neatlogs

- Sign up at https://app.neatlogs.com.
- Create a project.
- In the Vercel project settings, add an environment variable `NEATLOGS_API_KEY`
  with the key from that project, then redeploy.
- Free during the hackathon. Without the key the app still runs on its local trace.

## 2. Entire

- Install the CLI: `curl -fsSL https://entire.io/install.sh | bash`.
- Run `entire login` and finish the browser OAuth flow.
- Authorize the Entire GitHub App on the `zkasuran` account and grant it the
  `priorproof` repository.
- Capture the checkpoints: `entire enable -y --agent claude-code`, build the stages
  as separate commits, then `entire checkpoint list` and `entire checkpoint explain`.
- Copy the checkpoint link for the submission:
  `https://entire.io/gh/zkasuran/priorproof/commit/<sha>`. The checkpoint id is the
  `Entire-Checkpoint` trailer in that commit.

## 3. cfo.ai

- Sign up at cfo.ai. A card is required at signup.
- Cancel immediately to avoid being billed: open Settings, then Billing, then
  cancel right after signup. Do this before you forget, not later.
- Paste the business plan from `docs/BUSINESS-PLAN.md` into cfo.ai to produce the
  cfo.ai artifact for the submission.

## 4. OpenAI key for the app

- In the Vercel project settings, add an environment variable `OPENAI_API_KEY` with
  the app's key, then redeploy. The LLM client is provider-agnostic, so an
  `ANTHROPIC_API_KEY` can be set instead to run on Claude.

## 5. Flip the repository public at submission

- Flip it: `gh api -X PATCH repos/zkasuran/priorproof -F private=false`.
- Verify as a stranger, not as us. An anonymous fetch of the repo page must return
  200:

  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" https://github.com/zkasuran/priorproof
  ```

  It must print `200`. Check the demo URL and the Entire checkpoint link the same
  way. Our own `gh` calls are signed in and prove nothing here.

## 6. Announce on X

- Post the submission by quote-tweeting the official neatlogs post.
- Include the repository link and the demo link in the quote tweet.
- This needs an interactive sign-in, so it is a human step. The post text is built
  publish-ready in the lane content page.
