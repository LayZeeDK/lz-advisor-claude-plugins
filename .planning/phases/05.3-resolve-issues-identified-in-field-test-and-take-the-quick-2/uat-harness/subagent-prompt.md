# UAT Subagent Prompt (Phase 5.3)

This is the prompt passed to each `general-purpose` subagent spawned by
the Phase 5.3 UAT orchestrator. Placeholders in <ANGLE_BRACKETS> are
substituted by the orchestrator at spawn time.

## Your assignment

You are a UAT runner for Phase 5.3 of the lz-advisor plugin. Your job
is to run ONE skill against the Compodoc scenario and capture metrics.

- Skill: /lz-advisor.<SKILL_NAME>  (one of: plan, execute, review, security-review)
- Pass: <PASS>  (one of: baseline, post-fix)
- Plugin repo commit: <COMMIT_SHA>  (you are in a plugin-repo worktree at this commit)
- Plugin worktree path: <PLUGIN_WORKTREE_PATH>  (absolute path)
- Target repo: D:/projects/github/LayZeeDK/ngx-smart-components
- Compodoc worktree name: ngx-smart-components-uat-<SKILL_NAME>-<PASS>

## Step 0 -- Pre-flight assertions

FIRST, before any other action, verify worktree isolation (mitigates
Agent(isolation: "worktree") silent-failure bugs #33045, #37549, #39886):

1. Run `git rev-parse --git-dir` from inside the plugin worktree.
   Expect a path that indicates a worktree (contains ".git/worktrees/").
   If the path points to the main repo's .git directory, isolation
   failed -- return metrics JSON with failure_mode: "isolation_failed"
   and stop immediately.
2. Run `pwd` and confirm it is <PLUGIN_WORKTREE_PATH>. If it is not,
   return metrics JSON with failure_mode: "wrong_cwd" and stop.
3. Run `claude --version`, `git --version`, and `node --version` and
   capture. If any is missing, return failure_mode: "missing_dependency".

## Step 1 -- Create the Compodoc scratch worktree (non-destructive)

Run, from D:/projects/github/LayZeeDK/ngx-smart-components:

    git worktree add ../ngx-smart-components-uat-<SKILL_NAME>-<PASS> HEAD

If this fails because the path already exists, STOP and return
failure_mode: "worktree_collision". Never use `--force` on the initial
add -- the UAT-created path is named uniquely per skill/pass so collision
implies a leftover from a prior run.

## Step 2 -- Run the skill under test

From inside the Compodoc scratch worktree, run (as a single command,
absolute paths throughout):

    claude --model sonnet --effort medium \
      --plugin-dir <PLUGIN_WORKTREE_PATH>/plugins/lz-advisor \
      -p "/lz-advisor.<SKILL_NAME> <COMPODOC_PROMPT_BODY>" \
      --verbose --output-format stream-json \
      > uat-trace.ndjson

<COMPODOC_PROMPT_BODY> is the contents of compodoc-scenario-prompt.md
"Prompt body" section starting from `Set up Compodoc integration` and
ending at the post-guide note. The Nx guide is already embedded verbatim
between the `BEGIN NX GUIDE` and `END NX GUIDE` markers in
compodoc-scenario-prompt.md; do not modify the prompt body or reflow the
content between the BEGIN NX GUIDE / END NX GUIDE markers.

If the prompt length exceeds the Windows command-line limit (~8 KB),
fall back to writing the prompt body to a temp file and invoking
`claude -p @<tempfile>`. Capture this in failure_mode if it matters.

## Step 3 -- Parse the trace

Run:

    node <PLUGIN_WORKTREE_PATH>/.planning/phases/05.3-resolve-issues-identified-in-field-test-and-take-the-quick-2/uat-harness/parse-trace.mjs uat-trace.ndjson

This prints the metrics JSON to stdout. Capture that output into your
final message. Do not write it to a file inside the worktree.

## Step 4 -- Clean up the Compodoc worktree (safe teardown)

From D:/projects/github/LayZeeDK/ngx-smart-components:

1. Pre-check (non-force): run `git worktree remove ../ngx-smart-components-uat-<SKILL_NAME>-<PASS>`.
   This SUCCEEDS only if the worktree has no uncommitted changes. That is
   the happy path -- UAT runs should not leave uncommitted changes because
   the skills under test write plan files or commits.
2. If step 4.1 fails because of uncommitted changes, DO NOT escalate to
   `--force` automatically. Instead: run `git -C ../ngx-smart-components-uat-<SKILL_NAME>-<PASS> status --porcelain`,
   capture the list into your metrics JSON under `uncommitted_paths`,
   and then run `git worktree remove --force` ONLY on the UAT-named path
   (never on the main worktree). This force-removal is safe because the
   path prefix is uniquely UAT-named per name-prefix safety rule.
3. Post-check: run `git worktree list` and verify NO path containing
   `ngx-smart-components-uat-` remains. If one does, report it in
   failure_mode: "cleanup_incomplete".

## Step 5 -- Return metrics

Return the metrics JSON produced by step 3 as your final message,
plus a 2-3 sentence summary of what happened. Do not leave files in
either worktree; Plan 04's grader consumes only the final-message
payload.

Required metrics fields (from parse-trace.mjs output):
  skill, pass, commit, advisor_tool_calls, advisor_turns_used,
  maxturns_exhausted, first_try_success, advisor_word_count,
  advisor_final_response, advisor_model_id, executor_tool_calls,
  executor_completed, failure_mode

Plus fields you may add on failure: isolation_failed, wrong_cwd,
missing_dependency, worktree_collision, cleanup_incomplete,
uncommitted_paths.
