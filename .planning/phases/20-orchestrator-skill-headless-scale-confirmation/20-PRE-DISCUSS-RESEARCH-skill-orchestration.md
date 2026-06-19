# Phase 20 Pre-Discuss Research: Skill Orchestration Mechanics

Research target: Claude Code v2.1.x (live docs as of 2026-06-19). Scope: how a packaged
SKILL.md (`lz-advisor:lz-deep-research`) can orchestrate wave-batched cheap-tier worker
subagents + a Node aggregator + an Opus advisor, running HEADLESS under
`claude -p --permission-mode auto`.

Live docs are AI-blocked on `code.claude.com` via WebFetch; all `code.claude.com` content
below was fetched via `markdown.new` POST (succeeded on first try). Local plugin-dev /
skill-creator docs read directly from `~/.claude/plugins/`.

---

## Verified (with source + version)

### A. Subagent tool grants are the subagent's own, NOT inherited from the spawning skill's `allowed-tools`

- A named subagent's tools are governed by its OWN agent-file frontmatter: `tools`
  (allowlist) or `disallowedTools` (denylist). "Neither field set: the subagent inherits
  every tool available to the parent. `tools` only: the subagent gets only the listed
  tools." A skill's `allowed-tools` does not appear in the resolution chain.
  Source: code.claude.com/docs/en/tools-reference "Agent tool behavior"; code.claude.com/docs/en/sub-agents "Available tools". VERIFIED.
- Therefore: to let WORKER subagents `Write` evidence files, the GRANT lives in the
  worker AGENT file (e.g. `agents/<worker>.md` frontmatter `tools: Read, Write, WebSearch, WebFetch`),
  not in the skill. The skill cannot widen or narrow a subagent's tools. VERIFIED.

### B. SKILL `allowed-tools` is parsed but NOT enforced (and never constrained subagents anyway)

- GitHub issue anthropics/claude-code#37683 (opened 2026-03-23, closed **"not planned"**,
  labels `area:skills`/`bug`/`has repro`/`stale`): `allowed-tools` in SKILL.md frontmatter
  is parsed but does not restrict tool access; "NEVER" body rules also ignored; no
  structural workaround. Repro on claude-opus-4-6. Corroborated by issue #18837.
  Source: github.com/anthropics/claude-code/issues/37683. VERIFIED (bug, won't-fix).
- Consequence: a skill's `allowed-tools` is at best documentation / a hint, not a security
  or capability boundary, and it has no bearing on what spawned subagents may do.

### C. `AskUserQuestion` is unavailable to subagents AND has no `-p` headless answer path

- `AskUserQuestion` is explicitly in the list of tools "not available to subagents, even
  when listed in the `tools` field" (alongside `EnterPlanMode`, `ExitPlanMode`,
  `ScheduleWakeup`, `WaitForMcpServers`).
  Source: code.claude.com/docs/en/sub-agents "Available tools". VERIFIED.
- A background subagent that needs to ask "fails that tool call but continues."
  Source: code.claude.com/docs/en/sub-agents "Run subagents in foreground or background". VERIFIED.
- The skill runs in the MAIN session, so it *can* call `AskUserQuestion` interactively;
  but under `claude -p` there is no human to answer. The headless docs give no
  programmatic "am I headless" signal for a skill body; the documented convention is to
  pre-approve via flags and design sensible defaults.
  Source: code.claude.com/docs/en/headless. VERIFIED (absence of a detect-signal is itself documented behavior).

### D. Subagent nesting: depth-5 hard cap, fixed, both foreground & background

- "As of Claude Code v2.1.172, a subagent can spawn its own subagents." Depth = number of
  subagent levels below the main conversation, "regardless of whether each level runs in
  the foreground or background. A subagent at depth five does not receive the Agent tool
  and cannot spawn further. The limit is fixed and not configurable."
  Source: code.claude.com/docs/en/sub-agents "Spawn nested subagents" (`min-version: 2.1.172`). VERIFIED.
- The "background depth-5 cap, foreground any-depth" framing in the project's prior note is
  WRONG / outdated: the cap is depth-5 for BOTH modes. CORRECTED.
- A subagent gets the Agent tool only if `Agent` is in its `tools` list (or no `tools`
  field at all). `Agent(type1,type2)` allowlisting works only for an agent run as the MAIN
  thread via `claude --agent`; inside a subagent definition the parenthesized type list is
  IGNORED (it can spawn, but you cannot restrict which types from frontmatter).
  Source: code.claude.com/docs/en/sub-agents "Restrict which subagents can be spawned". VERIFIED.

### E. Task -> Agent rename

- "In version 2.1.63, the Task tool was renamed to Agent. Existing `Task(...)` references in
  settings and agent definitions still work as aliases."
  Source: code.claude.com/docs/en/sub-agents. VERIFIED (matches prior note).

### F. Foreground vs background semantics + the headless permission interaction

- Foreground subagents BLOCK the main conversation and surface permission prompts to the
  user as each tool call happens. Background subagents run concurrently, "run with the
  permissions already granted in the session and AUTO-DENY any tool call that would
  otherwise prompt."
  Source: code.claude.com/docs/en/sub-agents; tools-reference "Agent tool behavior". VERIFIED.
- **Critical for `--permission-mode auto`:** "If the parent uses auto mode, the subagent
  inherits auto mode and any `permissionMode` in its frontmatter is ignored: the classifier
  evaluates the subagent's tool calls with the same block and allow rules as the parent
  session." So under `claude -p --permission-mode auto`, the auto-mode classifier (not the
  worker's own frontmatter) gates each worker tool call -- including `Write` and
  `Bash`. Worker `Write` to the evidence dir should pass the classifier (in-workdir write);
  arbitrary Bash is classifier-reviewed.
  Source: code.claude.com/docs/en/sub-agents "Permission modes". VERIFIED.
- Plugin-shipped agents: "model and permissionMode are not supported for plugin-shipped
  agents." So lz-advisor's bundled worker/voter agents CANNOT set their own
  `permissionMode` or pin a `model` via frontmatter -- the spawning skill must pass `model`
  per-invocation through the Agent tool call, and permission mode is inherited from the
  parent session.
  Source: code.claude.com/docs/en/plugins-reference "Agents". VERIFIED. (Note: this caps the
  "cheap-tier worker" design -- the worker's model is set at spawn time by the orchestrator,
  not baked into the agent file.)

### G. Wave-batching is achievable via turn structure; `PostToolBatch` confirms the batch boundary

- The agentic loop blocks on a full batch of parallel tool calls before the next model
  call: the `PostToolBatch` hook fires "After a full batch of parallel tool calls resolves,
  before the next model call."
  Source: code.claude.com/docs/en/plugins-reference (hook events table). VERIFIED.
- Mental model (VERIFIED by the batch-boundary semantics): issue N Agent calls in ONE
  assistant turn -> session waits for ALL N results -> next turn issues the next batch.
  This is the only prompt-level lever for "<=5 in flight, wait per wave."

### H. NO documented platform-level concurrency cap for skill-spawned subagents; cap exists only for dynamic Workflows

- The Agent-tool and subagents docs describe parallel fan-out ("spawn multiple subagents to
  work simultaneously") with NO numeric cap and NO queueing guarantee. There is no
  documented `maxParallelAgents` / `maxConcurrentAgents` settings.json key -- it is an OPEN
  feature request (anthropics/claude-code#15487, #63938).
  Source: code.claude.com/docs/en/sub-agents; GitHub #15487/#63938. VERIFIED (the cap's ABSENCE is documented by the open FRs).
- A documented cap of `min(16, cpu_cores - 2)` concurrent + 1,000 total per run applies to
  DYNAMIC WORKFLOWS only -- which plugins cannot ship. It does NOT govern skill-spawned
  Agent fan-out. (claude-code-guide agent, citing workflows.md.) VERIFIED for workflows; not applicable here.

### I. `${CLAUDE_PLUGIN_ROOT}` is the correct path var; `${CLAUDE_SKILL_DIR}` does NOT exist

- The three documented plugin path variables are `${CLAUDE_PLUGIN_ROOT}` (plugin install
  dir), `${CLAUDE_PLUGIN_DATA}` (persistent state dir, survives updates -- created on first
  reference; correct home for any worker-installed deps), and `${CLAUDE_PROJECT_DIR}`
  (project root). All are substituted inline in skill/agent/hook/MCP content.
  Source: code.claude.com/docs/en/plugins-reference "Environment variables". VERIFIED.
- `${CLAUDE_SKILL_DIR}` is NOT a documented variable (no hit in plugins-reference, no hit
  in plugin-dev local docs). Reference the bundled aggregator as
  `${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/<script>.mjs`. CORRECTED vs the
  project MEMORY.md note that paired `${CLAUDE_SKILL_DIR}` with `${CLAUDE_PLUGIN_ROOT}`.
- Known caveat: issue #9354 reports `${CLAUDE_PLUGIN_ROOT}` can fail to expand in some
  command-markdown contexts. Skill-body expansion is the documented/normal path; verify in
  a spike if the aggregator path ever comes through empty. VERIFIED (caveat).

### J. Skill frontmatter requirements (authoritative local docs + live)

- Required: `name` (kebab-case, matches folder), `description` (third-person, "This skill
  should be used when..."). `version` is OPTIONAL (the live agensi field reference does not
  even list a `version` field; plugin-dev examples include it at `0.1.0`). Body in
  imperative form, lean (<500 lines ideal per skill-creator; 1,500-2,000 words per plugin-dev).
  Source: plugin-dev skill-development SKILL.md; skill-creator SKILL.md. VERIFIED.
- New-ish skill frontmatter fields surfaced by the live field reference (agensi.io,
  2026): `context: fork` (runs the skill itself as an isolated subagent with its own
  context window), `model` (only when `context: fork`), `effort` (low/medium/high),
  `disable-model-invocation`, `hooks`, `allowed-tools`. UNVERIFIED against the official
  code.claude.com skills page (see below) -- treat `context: fork` as plausible-but-confirm.

---

## skill-creator + plugin-dev authoritative guidance (local plugins, per coordinator directive)

Paths resolved under `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/`
(also mirrored in `cache/claude-plugins-official/.../unknown/`). Versions: plugin-dev and
skill-creator skills carry `version: 0.1.0` / unversioned.

- **skill-creator/skills/skill-creator/SKILL.md** (authoritative for skill methodology):
  - Subagent fan-out for evals: "For each test case, spawn two subagents in the same turn...
    Launch everything at once so it all finishes around the same time." Confirms the
    one-turn-fan-out model (Finding G) is the intended skill pattern.
  - Explicit no-subagent fallback: "In Claude.ai... doesn't have subagents... Do them one
    at a time." And Cowork: "if you run into severe problems with timeouts, it's OK to run
    the test prompts in series rather than parallel." -> series-fallback is an endorsed
    degradation path when parallel fan-out is constrained.
  - Frontmatter: only `name` + `description` required; description should be "pushy" to
    combat skill UNDER-triggering; `compatibility` field "optional, rarely needed". No
    `allowed-tools` shown in its own frontmatter.
  - Progressive disclosure: SKILL.md <500 lines ideal; `scripts/` for
    deterministic/repetitive code (the aggregator belongs here), `references/` loaded as
    needed, `agents/` dir holds subagent instruction files the skill reads before spawning.
  - "Look for repeated work across test cases" -> if every worker reinvents a helper,
    bundle it as a `scripts/` file. Directly supports the deterministic Node aggregator.
- **plugin-dev/skills/skill-development/SKILL.md** (authoritative for skill structure):
  third-person description, imperative body, progressive disclosure, references/examples/
  scripts dirs. Does NOT document `allowed-tools` semantics or any concurrency mechanism --
  silent on both (so live docs + issues are the only source there).
- **plugin-dev/skills/agent-development/SKILL.md**: agent frontmatter `name`, `description`,
  `model`, `color` (+ optional `tools` array). "Default: If omitted, agent has access to
  all tools." "Limit tools to minimum needed (principle of least privilege)." This is where
  the WORKER tool grant (`Write` etc.) must live -- confirms Finding A from the authoring side.
  NOTE divergence: this local doc lists `tools` as the only restriction field; the LIVE
  sub-agents doc adds `disallowedTools`, `background`, `effort`, `skills`, `mcpServers`,
  `isolation`, `memory`, `permissionMode`, `maxTurns`. The local doc is OLDER/incomplete;
  prefer the live sub-agents page for the full field set.
- **plugin-dev/skills/plugin-structure/SKILL.md + references/manifest-reference.md**:
  `.claude-plugin/plugin.json` requires `name`; `skills/<name>/SKILL.md` auto-discovered;
  `${CLAUDE_PLUGIN_ROOT}` for all intra-plugin paths, never hardcode/relative/`~`. This
  matches the live plugins-reference. The local docs do NOT mention `${CLAUDE_PLUGIN_DATA}`
  or `${CLAUDE_PROJECT_DIR}` -- the live plugins-reference is more current (3 vars vs 1).

### Divergences (local vs live) and which is more current

| Topic | Local plugin-dev/skill-creator | Live code.claude.com | More current |
|-------|--------------------------------|----------------------|--------------|
| Path vars | only `${CLAUDE_PLUGIN_ROOT}` | adds `${CLAUDE_PLUGIN_DATA}`, `${CLAUDE_PROJECT_DIR}` | LIVE |
| Subagent restriction fields | `tools` only | `tools`, `disallowedTools`, `permissionMode`, `background`, `effort`, `skills`, `mcpServers`, `isolation`, `maxTurns`, `memory` | LIVE |
| `allowed-tools` on skills | silent | parsed-not-enforced (#37683) | LIVE (issue) |
| `${CLAUDE_SKILL_DIR}` | absent | absent (does not exist) | agree -- DO NOT USE |
| Nesting depth | silent | depth-5 fixed cap, v2.1.172 | LIVE |

---

## Recommended mechanisms (concrete)

1. **Wave-batching (<=5 in flight):** Skill body instructs the session, per wave, to "issue
   exactly N (N<=5) Agent calls in a single turn, then wait for all N receipts before
   issuing the next wave." Lean on the turn/`PostToolBatch` boundary (Finding G). Because
   there is no platform cap (Finding H) and CLAUDE.md "max 2 parallel" rules are reported
   ignored, the cap must be a HARD, explicit, counted instruction in the skill body, ideally
   reinforced by spawning workers in the FOREGROUND (foreground blocks until the batch
   resolves; background fan-out has no natural backpressure). Spike to confirm adherence.

2. **Worker tool grants:** put `Write` (+ `Read`, `WebSearch`, `WebFetch` as role demands)
   in each worker AGENT file's `tools:` allowlist; OMIT `Agent` from worker `tools` so
   workers cannot themselves fan out (keeps depth at 2 and avoids accidental nesting).
   The skill's `allowed-tools` is irrelevant to workers.

3. **Headless permission path:** run `claude -p --permission-mode auto`. The skill's own
   `allowed-tools` is non-binding; rely on auto-mode's classifier. Workers inherit auto mode
   (their frontmatter `permissionMode` is ignored, and is unsupported for plugin agents
   anyway). For the orchestrator's one Bash aggregator call, declare
   `Bash(node:*)` (command-prefix filter form, matching the repo's existing `Bash(git:*)`
   pattern) -- `Bash(node "...")` is NOT the documented filter syntax. Invoke as
   `node "${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/aggregate.mjs" ...`.

4. **Interactive vs headless:** do NOT rely on a detection signal (none documented).
   Convention: attempt `AskUserQuestion` for clarification when the skill judges it useful;
   under `-p` the call simply has no answer path -> design the skill to fall back to STATED
   ASSUMPTIONS (surface them in output) rather than blocking. Workers must never call
   `AskUserQuestion` (unavailable to subagents).

5. **Advisor consult:** spawn the Opus advisor as a foreground subagent via Agent with a
   per-invocation `model` (Opus) override -- needed because plugin agents can't pin model in
   frontmatter. Advisor `tools` stay `Read, Glob` (read-only), `Agent` omitted.

6. **Aggregator path:** `${CLAUDE_PLUGIN_ROOT}/skills/lz-deep-research/scripts/aggregate.mjs`.
   Persistent worker deps (if any) -> `${CLAUDE_PLUGIN_DATA}`. Never `${CLAUDE_SKILL_DIR}`.

---

## Unverified / must-spike

- **U1. Wave-batch adherence under load.** No platform cap exists; CLAUDE.md concurrency
  rules are reported ignored (#15487 motivation). Whether a skill-body "<=5 per wave,
  foreground, wait" instruction is reliably obeyed by Sonnet/Opus across many waves is
  UNVERIFIED -- spike it (count concurrent in-flight Agent calls in a stream-json trace).
- **U2. High-fan-out failure mode.** Whether excess parallel Agent calls QUEUE, all run, or
  degrade I/O is UNDOCUMENTED for skill-spawned agents. One FR cites 24 procs in 2 min
  overwhelming disk I/O. Treat ">~10 concurrent" as a real risk, not folklore; the <=5 cap
  is prudent. UNVERIFIED behavior.
- **U3. `context: fork` skill field.** Surfaced by a third-party 2026 field reference, not
  confirmed on the official skills page (which I did not fetch). If real, it would let the
  skill itself run isolated -- but that conflicts with needing the main session to fan out
  and call AskUserQuestion. Confirm on code.claude.com/docs/en/skills before relying on it.
- **U4. `${CLAUDE_PLUGIN_ROOT}` expansion in skill body.** #9354 reports non-expansion in
  some markdown contexts. Verify the aggregator path resolves non-empty in a `-p` run.
- **U5. Auto-mode classifier verdict on worker `Write`/`node` Bash.** The classifier's
  accept/deny on a worker writing to a non-cwd evidence dir, or on `node <abs-path>`, is
  policy-driven and not statically documented -- confirm in the same spike as U1
  (the repo's CLAUDE.md already notes `auto` is needed for non-git Bash like `nx`).
- **U6. `version` field.** Optional; harmless to include (`2.x.x` to match the plugin).
  Not load-bearing.

---

## Sources

Live (fetched via markdown.new POST; code.claude.com is AI-blocked to WebFetch):
- code.claude.com/docs/en/sub-agents -- nesting depth-5 (v2.1.172), Task->Agent (v2.1.63),
  foreground/background, auto-mode inheritance, `tools`/`disallowedTools`, AskUserQuestion
  unavailable to subagents, preload `skills`, `Agent(type)` main-thread-only.
- code.claude.com/docs/en/tools-reference -- "Agent tool behavior" (tool-grant resolution,
  background auto-deny), Bash tool (timeout/output limits, no concurrency cap).
- code.claude.com/docs/en/plugins-reference -- three path variables, plugin-agent
  `model`/`permissionMode` unsupported, hook events incl. `PostToolBatch`, install scopes.
- code.claude.com/docs/en/headless -- `-p`/`--print`, `--bare`, `--allowedTools`,
  `--permission-mode`, no headless-detection signal.

GitHub issues:
- anthropics/claude-code#37683 (allowed-tools not enforced, closed not-planned), #18837 (dup).
- anthropics/claude-code#15487, #63938 (maxParallelAgents / maxConcurrentAgents -- open FRs).
- anthropics/claude-code#9354 (${CLAUDE_PLUGIN_ROOT} non-expansion in command markdown).
- anthropics/claude-code#22902 (custom skills paths FR -- confirms only ${CLAUDE_PLUGIN_ROOT} works).

Local authoritative plugin docs (per coordinator directive):
- ~/.claude/plugins/marketplaces/claude-plugins-official/plugins/skill-creator/skills/skill-creator/SKILL.md
- ~/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/skills/skill-development/SKILL.md
- .../plugin-dev/skills/agent-development/SKILL.md
- .../plugin-dev/skills/plugin-structure/SKILL.md (+ references/manifest-reference.md, command-development/references/frontmatter-reference.md)

Third-party field reference (UNVERIFIED for new fields):
- agensi.io/learn/skill-md-format-reference (2026) -- context:fork, effort, hooks fields.

In-repo cross-check:
- plugins/lz-advisor/skills/lz-execute/SKILL.md -- existing `allowed-tools: Agent(lz-advisor:advisor), Read, Glob, Edit, Write, Bash(git:*), WebSearch, WebFetch` and `Bash(git:*)` filter pattern.
