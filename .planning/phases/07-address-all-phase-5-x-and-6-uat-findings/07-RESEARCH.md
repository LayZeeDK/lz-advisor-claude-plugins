# Phase 7: Address all Phase 5.x and 6 UAT findings - Research

**Researched:** 2026-05-01
**Domain:** Verification-chain integrity across multi-hop Sonnet executor + Opus subagent prompt-engineering chain (no runtime enforcement available; "no hooks for v1" plugin constraint).
**Confidence:** HIGH for areas already covered in `discuss-research/` (D-03, D-04, D-05); MEDIUM-HIGH for the gap areas this document fills (D-01 pv-* synthesis discipline, D-02 Phase 6 G1+G2 fold-in, D-07 four-guard confidence-laundering, smoke-fixture design); HIGH for Validation Architecture (anchored in existing `KCB-economics.sh` / `DEF-response-structure.sh` patterns).

## Summary

Phase 7 closes the verification-chain-integrity failure surface that 13 UAT cycles (8 on plugin 0.9.0 + 5 on 0.8.9; 64 tests, 45 PASS, 19 ISSUES) surfaced empirically. The empirical evidence is unambiguous: paired upstream-prevention (advisor refuse-or-flag, structural pv-* validation, hedge-propagation rule) plus downstream-detection (smoke fixtures, reviewer escalation hook, review-skill scan criterion, Verified: trailer + JSONL trace cross-grep) is the architecturally consistent fix. Single-layer fixes were attempted in Phase 6 Plan 06-05 (G1+G2 structural landing) and empirically failed on plan-fixes / execute-fixes replays because the executor self-anchors on claimed framework knowledge (Finding H) rather than missing the rule (Finding G1+G2 original interpretation).

Three research insights drive Phase 7's design:

1. **Citations and pv-* anchors do not guarantee groundedness.** Recent RAG research [CITED: whyaitech.com/notes/systems-note-002, TruLens RAG Triad] shows citation-based verification creates "illusion of groundedness" because models confabulate "hallucinated bridges" between retrieved fragments. Plan 07-01's pv-* validation rule must therefore operate on the `<evidence>` content (require source-path-or-URL-actually-read-this-session + tool-output excerpt), not just the structural shape. Empty-evidence and self-anchor evidence (e.g., `method="Nx semantics"` per the 4th UAT) MUST be structurally rejected.

2. **Grammar-constrained decoding is unavailable in this environment.** Token-level XML schema enforcement [CITED: arxiv.org/html/2509.08182v1] would close the synthesis-discipline gap deterministically, but Claude Code does not expose grammar constraints to plugins. Phase 7 substitutes a smoke-fixture verification layer that grep-validates pv-* structure post-hoc on stdout traces (Tier 1) plus a UAT-replay layer that checks behavior end-to-end (Tier 2). This matches the three-layer self-validating-agents architecture [CITED: claudefa.st/blog/tools/hooks/self-validating-agents] adapted for the no-hooks constraint: prompt-layer rules (micro) + smoke fixtures (macro) + UAT replay (team).

3. **Outcome-based verification beats transcript parsing.** Agent self-reports lie systematically [CITED: dev.to/moonrunnerkc 5-check model]. Plan 07-02's `Verified:` trailer convention is therefore a *detection signal*, not a verification mechanism: the smoke fixture must grep the JSONL trace for the corresponding `tool_use` event AND the trailer; either alone is non-conforming. This architecturally separates the agent's narrative (untrusted) from the empirical signal (trusted).

**Primary recommendation:** Ship the 6 plans in CONTEXT.md D-01 ordering (07-01 first as empirical anchor; 07-02 through 07-05 in any order; 07-06 last). Use additive content within existing byte-identical canon blocks (`<context_trust_contract>`, `<orient_exploration_ranking>`, Common Contract Rules 1-7) rather than restructuring; this preserves Phase 6 Plan 06-05 + Phase 5.6 Plan 06/07 settled canon and keeps the diff surface small. Land each fix-mechanism plan paired with a smoke fixture in 07-06 (Phase 5.4 D-15 / Phase 5.6 D-03+D-05 / Phase 6 D-03+D-04 precedent).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01: Phase 7 ships 6 themed plans matching empirical failure-class clustering across 13 UAT cycles, with explicit ordering. Plan 07-01 lands first because its pv-* validation rule is the empirical anchor for downstream guards. Plans 07-02..07-05 may run in any order after 07-01; 07-06 lands last:**

- **07-01: pv-* synthesis discipline** -- Closes B.1 (carry-forward + synthesis mandate) + B.2 (XML-format mandate, source+evidence required, plain-bullet "Pre-verified Claims" sections forbidden) + H (block confabulated synthesis on Class-2/3/4 questions; ToolSearch availability rule fires before pv-* synthesis when input contains agent-generated source). Touches `references/context-packaging.md` Common Contract Rule 5 strengthening + new pv-validation rule + 4 SKILL.md `<context_trust_contract>` byte-identical canon (Plan 06-05 G2 supplement). Acceptance criteria include G1+G2 empirical closure (re-run plan-fixes + execute-fixes UAT subset; verify ToolSearch availability rule fires OR pv-* synthesis structurally rejects empty-evidence blocks).
- **07-02: verify-skip discipline** -- Closes A (Reconciliation policy extension to apply-then-revert flow) + E.1 (advisor refuse-or-flag rule in 3 agent prompts when source material contains hedge markers) + E.2 (plan-step-shape rule: numbered Run:<cmd> + Verify:<conditions> directives MUST execute as Bash before commit) + G (review-skill scan criterion for hedged claims without `Verified:` trailer / pv-* anchor) + silent-resolve sub-pattern (plan-skill output convention requiring explicit disposition for ALL numbered input findings). Touches `agents/{advisor,reviewer,security-reviewer}.md` + `lz-advisor.execute/SKILL.md` `<verify_before_commit>` block + `lz-advisor.review/SKILL.md` scan criterion + `lz-advisor.plan/SKILL.md` output convention.
- **07-03: confidence-laundering guards (Finding C)** -- Four guards: (i) hedge propagation rule in `references/context-packaging.md` Common Contract; (ii) cross-skill hedge tracking in `references/orient-exploration.md`; (iii) version-qualifier anchoring rule in `references/context-packaging.md` Common Contract; (iv) scope-disambiguated provenance markers (`scope: api-correctness`, `scope: security-threats`, etc.) on each SKILL.md output template + Common Contract.
- **07-04: word-budget enforcement (Finding D)** -- All 3 agent prompts (advisor / reviewer / security-reviewer) get descriptive triggers + worked example + structural sub-caps. Three new smoke fixtures: `D-advisor-budget.sh`, `D-reviewer-budget.sh`, `D-security-reviewer-budget.sh`.
- **07-05: reviewer web-tool design (Finding F)** -- Option 1+2 in tandem. Touches `lz-advisor.review/SKILL.md` Phase 1 (pre-emptive Class-2 surface enumeration) + `agents/reviewer.md` (structured `<verify_request>` block emit) + `lz-advisor.review/SKILL.md` Phase 3 (executor parses `<verify_request>` + re-invokes reviewer once with anchors).
- **07-06: smoke fixture + UAT replay + version bump + VERIFICATION.md** -- Single comprehensive multi-hop chain fixture; subset UAT replay (minimum: plan-fixes + execute-fixes + security-review per Phase 6 amendment 5 precedent); plugin version bump 0.9.0 -> 0.10.0; `07-VERIFICATION.md` produced AND `06-VERIFICATION.md` amendment 6 written downgrading PASS-with-caveat to PASS once Plan 07-01 verification passes.

**D-02: Phase 6 G1+G2 empirical residuals fold into Phase 7 Plan 07-01 as acceptance criteria.** Per Finding H, the residual root cause is rule-bypass-via-self-anchor (not rule-miss); Plan 07-01's structural pv-* validation closes it as a side-effect of H's fix. Phase 6 06-VERIFICATION.md gets amendment 6 (written by Plan 07-06) downgrading PASS-with-caveat to PASS once Plan 07-01 verification passes. Phase 6 stays in `executing` state for milestone-audit purposes until Phase 7 closes.

**D-03: Word-budget enforcement -- Hybrid pattern: descriptive triggers + worked example + structural sub-caps + per-agent smoke fixtures.** Sub-cap structure for reviewer.md and security-reviewer.md: each Findings block <=80w, Threat Patterns / Cross-Cutting Patterns block <=160w, Missed-surfaces block <=30w, total <=300w. Advisor stays 100w with no sub-caps. Per-agent smoke fixtures: D-advisor-budget.sh, D-reviewer-budget.sh, D-security-reviewer-budget.sh. Closure criterion: all three smoke fixtures green on plugin 0.10.0.

**D-04: Reviewer web-tool design -- Option 1+2 in tandem.** Reviewer tool grant stays `["Read", "Glob"]` (Option 3 explicitly rejected per OWASP + arXiv 2601.11893 + Claude Code Issue #20264). Option 1 (pre-emptive Class-2 scan in executor): `lz-advisor.review/SKILL.md` Phase 1 gains an explicit step. Option 2 (reviewer escalation hook): `agents/reviewer.md` system prompt gains a directive to emit a structured `<verify_request question="..." class="2" anchor_target="pv-..."/>` block; `lz-advisor.review/SKILL.md` Phase 3 detects these blocks; one-shot only.

**D-05: Verify-before-commit pattern -- Cost-cliff aware 4-element pattern.** Element 1 (advisor refuse-or-flag rule): all 3 agent prompts gain a directive flagging unresolved verify-first markers with literal frame `"Unresolved hedge: <marker text>. Verify <action> before/after committing."`. Element 2 (plan-step-shape rule): numbered `Run: <command>` + `Verify: <conditions>` plan steps MUST execute as Bash before commit. Element 3 (cost-cliff allowance): cheap synchronous validations (npm ls, git grep, lint, tsc --noEmit) execute pre-commit; long-running async (full test suite, dev server, nx run-many) move to wip:-prefixed commit + `## Outstanding Verification` section in body. Element 4 (Verified: trailer convention): commit body MUST include `Verified: <claim>` trailer when executor performs verification action; trailer is detection signal, not verification mechanism. Smoke fixture grep-checks the JSONL trace for the corresponding `tool_use` event AND the trailer presence; either alone is non-conforming.

**D-06: Plugin version 0.9.0 -> 0.10.0 (SemVer minor).** Matches Phase 6 precedent (0.8.4 -> 0.9.0 minor for trust-contract rewrite). Contract-shape changes warrant minor bump. Applies to `plugins/lz-advisor/.claude-plugin/plugin.json` + 4 SKILL.md frontmatter `version:` fields. Not 1.0.0 (deferred).

**D-07: Confidence-laundering guards (Finding C) -- Four complementary guards ship together in Plan 07-03.** Hedge propagation rule (Common Contract): when source material contains a verify-first marker, the executor MUST either (a) perform verification step and replace marker with evidence citation, or (b) carry the marker verbatim into `## Source Material` section, forbidden from packaging the same content under `## Pre-verified Claims`. Cross-skill hedge tracking (`references/orient-exploration.md`): workflow-level note that successive skills MUST NOT strip verify-first markers introduced by upstream skills. Version-qualifier anchoring rule (Common Contract): when an upstream artifact introduces a version qualifier ("Storybook 8+"), executor MUST verify the qualifier against installed version (read package.json) before propagating; either confirm with `pv-version-anchor` block or strip-and-replace with empirically observed version. Scope-disambiguated provenance markers (Common Contract + each SKILL.md output template): verdict-issuing skills tag verdicts with question-class scope (`scope: api-correctness`, `scope: security-threats`, `scope: performance`, `scope: accessibility`); downstream skills check scope-match.

### Claude's Discretion

- Exact threshold heuristic for cost-cliff in D-05 Element 3 (timeout-based vs command-name pattern vs explicit plan annotation; suggested: command-name pattern with explicit override list `nx storybook`, `nx test*`, `nx serve*`, full test suites)
- Smoke fixture letter naming for new fixtures (D-{advisor,reviewer,security-reviewer}-budget.sh keeps D historical anchor; E-verify-before-commit.sh keeps E anchor; B-pv-validation.sh or H-self-anchor.sh for pv-* validation)
- Exact word-count sub-cap thresholds in D-03 (suggested 80w / 160w / 30w but planner may calibrate based on observed structural breakdown of representative outputs)
- Exact `<verify_request>` schema in D-04 (suggested fields: `question`, `class`, `anchor_target`, optional `severity`; planner picks; documented in `references/context-packaging.md`)
- Reviewer re-invoke behavior if first re-invoke still surfaces the same hedge (suggested: emit ungrounded finding with explicit "verification unsuccessful" tag; do NOT loop)
- WIP commit prefix convention details (suggested: `wip:` lowercase prefix; alternative `chore(wip):`; planner picks aligned with existing project conventional-commits style)
- `Verified: <claim>` trailer format (suggested: one trailer per verified claim, format `Verified: <claim text>` with optional `Verified-by: <tool_use_id>` for trace cross-reference)
- UAT replay scope in Plan 07-06 (minimum: plan-fixes + execute-fixes + security-review per Phase 6 amendment 5 precedent; planner may extend to full 8-skill chain if budget allows)
- Smoke fixture design for B/H pv-* validation: parser approach (XML-aware vs regex on `<evidence>` content) and rejection criteria for empty/claimed-knowledge `<evidence>` fields
- Whether to extend existing `KCB-economics.sh` with B+H assertions vs ship a new `B-pv-validation.sh` (existing convention: KCB owns Findings K + C + B; ladder may grow)
- Plan ordering 07-04 / 07-05 vs 07-02 / 07-03 (D-01 says 07-01 first then any order; planner may parallelize or serialize based on commit-revert preference)

### Deferred Ideas (OUT OF SCOPE)

- README "Recommended prompt shape" section -- deferred again
- 1.0.0 marketplace-readiness cut -- deferred until Phase 7 closes empirically AND a follow-up regression cycle confirms zero residuals
- Hard-rules layer for word-budget (option 4 in D-03 framing) -- deferred unless 0.10.0 cycle confirms hybrid is insufficient
- Reviewer tool grant extension (Option 3 of Finding F) -- permanently deferred
- Strict verify-before-commit (no cost-cliff allowance) -- deferred unless cost-cliff-aware fails next UAT
- maxTurns cap removal or SendMessage-based bidirectional advisor -- architectural change, deferred since Phase 5.3
- Pro / Free plan tier UAT cross-tier verification -- structurally impossible from Team subscription
- Pattern D as a `claude -p` linter / pre-flight check -- deferred from Phase 6
- Fifth catch-all class in Pattern D -- deferred from Phase 6
- Smoke-test extension for per-class web-tool coverage -- deferred from Phase 6
- Retroactive extraction of Pattern A + B to shared reference -- deferred from Phase 6
- KCB-economics.sh extension for `.d.ts` reads as Pre-Verified Claim source -- deferred from Phase 6
- Plugin README update for Pattern D / verify-before-commit / pv-* validation rule -- deferred to next polish phase
- TeammateIdle hook analog for verify-before-commit -- "no hooks for v1" precludes
- Reviewer iterative re-invoke loop (multiple `<verify_request>` rounds) -- deferred per Spotify Honk one-shot
- `Verified-by: <tool_use_id>` trailer field for trace cross-reference -- planner may defer if parsing complexity outweighs gain

</user_constraints>

## Phase Requirements

No requirement IDs were assigned; Phase 7 was added after the Phase 1-4 v1 requirement set was locked. The load-bearing acceptance-criteria source is CONTEXT.md decisions D-01..D-07 plus PHASE-7-CANDIDATES.md Findings A-H + silent-resolve sub-pattern.

| Pseudo-ID | Description | Research Support |
|-----------|-------------|------------------|
| FIND-A | Silent apply-then-revert reconciliation (n=1 in-skill confirmed; needs n>=3 across heterogeneous override scenarios) | Plan 07-02 reconciliation policy extension; smoke fixture E-verify-before-commit.sh (advisor refuse-or-flag rule) |
| FIND-B.1 | pv-* carry-forward gap + synthesis mandate for orient-phase empirical findings | Plan 07-01 pv-validation rule + Common Contract Rule 5 strengthening; XML format mandate |
| FIND-B.2 | Executor confabulates plain-bullet "Pre-verified Claims" without verification | Plan 07-01 XML-format-mandatory rule + source-path-or-URL + tool-output excerpt requirements |
| FIND-C | 4-guard cross-skill confidence-laundering chain (hedge prop, cross-skill tracking, version-qualifier anchoring, scope-disambiguated provenance) | Plan 07-03 four guards in Common Contract + orient-exploration.md + each SKILL.md output template |
| FIND-D | Word-budget regression (security-reviewer +46% on 0.9.0 vs 300w cap; reviewer +37%; advisor 9-21%) | Plan 07-04 hybrid pattern (descriptive triggers + worked example + structural sub-caps + per-agent smoke fixtures); D-03 anchored in PromptHub Claude 4 + 3% ablation |
| FIND-E.1 | Apply-without-verify on surviving hedge markers in plan rationale | Plan 07-02 advisor refuse-or-flag rule with literal frame `"Unresolved hedge: <marker>. Verify <action> before/after committing."` |
| FIND-E.2 | Apply-without-verify on EXPLICIT Run/Verify directives in numbered plan steps; cost-cliff at long-running async | Plan 07-02 plan-step-shape rule + cost-cliff allowance (cheap pre-commit; long-running -> wip:-commit + Outstanding Verification section) |
| FIND-F | Reviewer agent has no web-tool grant by design; Class-2 questions cannot self-verify | Plan 07-05 Option 1 (pre-emptive Class-2 scan in executor) + Option 2 (reviewer `<verify_request>` escalation hook with one-shot re-invoke) |
| FIND-G | Review skill provides no safety net for verify-before-commit gaps in changed code | Plan 07-02 reviewer scan criterion: flag commits implementing hedged claims without `Verified:` trailer or pv-* anchor |
| FIND-H | Trust-contract carve-out fires but executor self-confabulates pv-* anchor from claimed framework knowledge (refines G1+G2 root cause from "rule miss" to "rule bypass via self-anchor") | Plan 07-01 structural pv-* validation: `<evidence>` MUST cite source path/URL read in this skill execution + tool-output excerpt; rejects claimed-knowledge anchors |
| FIND-silent-resolve | Plan SKILL.md silently drops numbered input findings without acknowledgment | Plan 07-02 plan-skill output convention: ALL numbered input findings receive explicit disposition |
| GAP-G1+G2-empirical | Plan 06-05 trust-contract sentinels structurally landed but empirically residual (plan-fixes + execute-fixes replays still 0 ToolSearch / 0 web tools on plugin 0.9.0) | Plan 07-01 acceptance criteria include re-run UAT subset; ToolSearch-availability rule supplement closes G2 as additive content within byte-identical canon |

## Project Constraints (from CLAUDE.md)

### Project-level constraints (D:\projects\github\LayZeeDK\lz-advisor-claude-plugins\CLAUDE.md)

- Plugin uses **only Claude Code's native plugin components** (skills, agents) -- no Claude API or `advisor_20260301` tool dependency. All Phase 7 mechanisms must be expressible in SKILL.md prose / agent system prompt / references markdown.
- **Zero external dependencies.** No new npm package, no MCP server, no hook (PROJECT.md "no hooks for v1"). Smoke fixtures use existing toolchain: Bash + `rg` + JSONL trace grepping + `claude -p`.
- **Skills (not commands)** are the entry-point primitive. Phase 7 modifies `skills/lz-advisor.{plan,execute,review,security-review}/SKILL.md` and `agents/{advisor,reviewer,security-reviewer}.md`; no `commands/` files added.
- **`lz-advisor.` namespace prefix** on all skills (avoids collision with other plugins).
- **Three agents, four skills.** Tool grant stays `["Read", "Glob"]` for advisor/reviewer/security-reviewer (Plan 07-05 Option 3 permanently rejected per OWASP / arXiv 2601.11893 / Claude Code Issue #20264).
- **`maxTurns: 3` stays** for all three agents. Plan 07-04 sub-caps work within existing turn budget.
- **No hardcoded paths** -- use `${CLAUDE_PLUGIN_ROOT}` for all reference @-loads.
- **Skill verification convention:** `claude --model sonnet --effort medium --plugin-dir plugins/lz-advisor -p "/lz-advisor.<skill> <task>" --verbose` for non-interactive UAT replay (validated Phase 2). Plan 07-06 UAT replay subdirectory follows this pattern.

### Global user constraints (Windows arm64 + Git Bash + ASCII-only)

- **ASCII-only in all written artifacts** -- no emojis, no Unicode box-drawing, no em/en dashes, no curly quotes, no ellipsis, no bullet glyphs (`*` not `U+2022`). Tree diagrams use `|`, `|--`, `'--`, `-`. Status markers: `[OK]`, `[ERROR]`, `[WARN]`, `[SKIP]`. Phase 7 SKILL.md / agent / reference / smoke-fixture text MUST honor this; Phase 6 Plan 06-05/06/07 already does -- preserve.
- **Git Bash on Windows arm64** -- all smoke fixtures (`D-advisor-budget.sh`, `D-reviewer-budget.sh`, `D-security-reviewer-budget.sh`, `E-verify-before-commit.sh`, optional `B-pv-validation.sh`) MUST run under Git Bash. Use `rg` (not `| grep`); use `git grep` for tracked-file search; use Unix paths (forward slashes; `/dev/null` not `NUL`).
- **No `cd <path> && <cmd>`** -- defeats `allowed-tools` pattern matching. Use absolute paths.
- **No PATH modifications.** Use absolute paths for tools.
- **No multi-line content via Bash heredocs / echo / inline string literals** -- use the Write tool. Smoke fixtures MAY use heredocs internally (existing `KCB-economics.sh` does so for fixture-file creation), but document creation always via Write.
- **`rg` only on stdin** -- never `| grep`. Replace any third-party snippet with `| grep` inline.
- **`git grep` for tracked-file search** (cannot search gitignored / untracked); fall back to `rg -uu` for `node_modules/` or other gitignored paths.
- **No AI attribution in commits.** No `Co-Authored-By` trailers, no `Generated with` lines.
- **`git mv` for moves/renames.** Never handcraft unified-diff patches.
- **Avoid `git add .` / `git add -A` / `git add -u`.** Always stage specific files by name.
- **No `cd <path>` in commands.** Bash tool persists working directory; use absolute paths.
- **`SendMessage` summary required** for any agent dispatch (5-10 word preview).

### GSD-workflow constraints (CLAUDE.md project section)

- **Always commit STATE.md after `/gsd-plan-phase` completes** before presenting final status to user.
- **Never skip `verify_phase_goal`** -- after all plans execute, spawn gsd-verifier to produce `07-VERIFICATION.md`. Plan 07-06 owns this artifact AND `06-VERIFICATION.md` amendment 6 (downgrade PASS-with-caveat to PASS).

## Standard Stack

### Core (Phase 7 modifies these existing files; no new files in plugin tree except optionally `B-pv-validation.sh`)

| Library / Asset | Version | Purpose | Why Standard |
|-----------------|---------|---------|--------------|
| `plugins/lz-advisor/agents/advisor.md` | system prompt; effort: high; maxTurns: 3 | Strategic advisor; Plan 07-02 adds advisor refuse-or-flag rule (E.1); Plan 07-04 reinforces 100w cap with descriptive triggers + worked example | [VERIFIED: file read 2026-05-01] -- existing structure preserved; additive content within `## Output Constraint` and `## Edge Cases` sections |
| `plugins/lz-advisor/agents/reviewer.md` | system prompt; effort: xhigh; maxTurns: 3 | Code quality reviewer; Plan 07-04 adds sub-caps + descriptive triggers; Plan 07-05 adds `<verify_request>` escalation hook directive; Plan 07-02 adds reviewer scan criterion for verify-before-commit gaps | [VERIFIED: file read 2026-05-01] -- existing two-section contract (`### Findings` 250w + `### Cross-Cutting Patterns` 100-150w) preserved; sub-caps match existing budget rationalization |
| `plugins/lz-advisor/agents/security-reviewer.md` | system prompt; effort: xhigh; maxTurns: 3 | Security reviewer; Plan 07-04 same word-budget treatment as reviewer; Plan 07-02 advisor-equivalent refuse-or-flag rule | [VERIFIED: file read 2026-05-01] -- existing two-section contract (`### Findings` 250w + `### Threat Patterns` 100-150w) preserved |
| `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md` | v0.9.0 (bump to 0.10.0 in 07-06) | Plan 07-02 adds silent-resolve fix; Plan 07-03 adds scope-disambiguated provenance markers in output template; Plan 07-06 version bump | [VERIFIED: file read 2026-05-01] -- `<context_trust_contract>` block at lines 37-56 already contains Plan 06-05 G2 ToolSearch-availability rule; Plan 07-01 adds supplement |
| `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` | v0.9.0 (bump to 0.10.0 in 07-06) | Plan 07-02 adds `<verify_before_commit>` block; Plan 07-03 adds scope-disambiguated provenance markers + version-qualifier rule cross-reference; Plan 07-01 adds ToolSearch-availability supplement to `<context_trust_contract>` (G2 closure); Plan 07-06 version bump | [VERIFIED: file read 2026-05-01] -- six-phase workflow preserved; `<verify_before_commit>` block lands between `<execute>` Phase 3 and `<durable>` Phase 4, OR within `<durable>` Phase 4 as additive content (planner picks) |
| `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md` | v0.9.0 (bump to 0.10.0 in 07-06) | Plan 07-05 adds Phase 1 pre-emptive Class-2 enumeration + Phase 3 `<verify_request>` block detection + executor re-invoke logic; Plan 07-02 adds review-skill scan criterion; Plan 07-06 version bump | [VERIFIED: file read 2026-05-01] -- three-phase workflow (scan / consult / output) preserved; Phase 1 `<scan>` block already includes Common Contract Rules 5 + 5a wrapping for fetched content |
| `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` | v0.9.0 (bump to 0.10.0 in 07-06) | Plan 07-03 adds scope-disambiguated provenance markers in output template; Plan 07-06 version bump | [VERIFIED: file read 2026-05-01] -- three-phase workflow preserved; Phase 1 `<scan>` already references Class 2-S sub-pattern (Phase 6 Plan 06-06) |
| `plugins/lz-advisor/references/context-packaging.md` | shared reference | Plan 07-01 strengthens Common Contract Rule 5 with new pv-validation rule (mandatory XML format, `<evidence>` MUST cite source path/URL read in this skill + tool-output excerpt); Plan 07-03 adds hedge propagation rule + version-qualifier anchoring rule + scope-disambiguated provenance markers | [VERIFIED: file read 2026-05-01] -- Common Contract Rules 1-7 with worked examples; existing `<pre_verified source="..." claim_id="..."><claim>...</claim><evidence method="...">...</evidence></pre_verified>` shape stays unchanged; Plan 07-01 adds enforceability text only |
| `plugins/lz-advisor/references/orient-exploration.md` | shared reference | Plan 07-03 adds cross-skill hedge tracking section (workflow-level note: successive skills MUST NOT strip verify-first markers introduced by upstream skills) | [VERIFIED: file read 2026-05-01] -- Pattern D 4-class taxonomy + Class 2-S sub-pattern stays; cross-skill hedge tracking is a new sub-section, not retroactive churn |
| `plugins/lz-advisor/.claude-plugin/plugin.json` | v0.9.0 (bump to 0.10.0 in 07-06) | Version bump only | [VERIFIED: file read 2026-05-01] -- 11-line manifest; one-line version field |

### Supporting (smoke-fixture infrastructure -- Phase 7 adds 4-5 new fixtures using existing patterns)

| Asset | Version | Purpose | When to Use |
|-------|---------|---------|-------------|
| `.planning/phases/05.4-.../smoke-tests/D-advisor-budget.sh` | NEW (Plan 07-04) | Asserts advisor SD <=100w on representative input | Per-release regression gate; reuses `extract-advisor-sd.mjs` (existing JSONL parser); Bash + `rg` + `wc -w` |
| `.planning/phases/05.4-.../smoke-tests/D-reviewer-budget.sh` | NEW (Plan 07-04) | Parses reviewer output by section header; asserts each Findings <=80w, Threat Patterns <=160w, Missed-surfaces <=30w, total <=300w | Per-release regression gate; section-header regex anchors (`^### Findings$`, `^### Cross-Cutting Patterns$`, etc.); per-section `wc -w` on extracted ranges |
| `.planning/phases/05.4-.../smoke-tests/D-security-reviewer-budget.sh` | NEW (Plan 07-04) | Same shape as D-reviewer-budget.sh for security-reviewer (`### Findings` + `### Threat Patterns`) | Per-release regression gate |
| `.planning/phases/05.4-.../smoke-tests/E-verify-before-commit.sh` | NEW (Plan 07-02 + 07-06) | Synthesizes hedge-marker + Run:/Verify: directive scenario; asserts (a) advisor flags unresolved hedge with canonical frame OR (b) executor performs verification action AND adds `Verified:` trailer OR (c) wip: commit + Outstanding Verification section | Per-release regression gate; cross-source assertion pattern: JSONL trace `tool_use` events + final commit body inspection |
| `.planning/phases/05.4-.../smoke-tests/B-pv-validation.sh` (NEW) OR extend `KCB-economics.sh` (planner picks) | NEW or extended (Plan 07-01 + 07-06) | Asserts pv-* blocks use canonical XML format + `<evidence>` cites source path/URL + tool-output excerpt; rejects empty / claimed-knowledge `<evidence>` | Per-release regression gate; XML extraction via regex (no XML parser available in Git Bash environment); empty-evidence detection via `rg '<evidence[^>]*>\s*</evidence>'` and self-anchor detection via `rg 'method="(Nx semantics\|claimed knowledge\|prior knowledge)"'` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hybrid descriptive-triggers + sub-caps + smoke fixtures (D-03) | Hard-rules layer for word-budget (option 4 in original D-03 framing) | Hard rules close the regression definitively but [CITED: buildthisnow.com Apr 2026 ablation] cost ~3% coding-quality drop. Hybrid is Pareto-optimal until 0.10.0 cycle empirically demonstrates insufficiency. |
| `<verify_request>` structured-output escalation (D-04 Option 2) | Extend reviewer tool grant with `WebSearch`/`WebFetch` (D-04 Option 3) | Tool-grant extension contradicts [CITED: OWASP AI Agent Security Cheat Sheet], [CITED: arxiv.org/html/2601.11893v1 Taming Various Privilege Escalation], and [CITED: github.com/anthropics/claude-code/issues/20264]; subagent privilege inheritance is a documented escalation risk. **Permanently deferred.** |
| Cost-cliff aware verify-before-commit (D-05) | Strict verify-before-commit (no cost-cliff allowance) | Strict closes E.2 deterministically but conflicts with the empirical 8th UAT pattern (cheap directives ran 3/4; long-running 1/4 skipped). Cost-cliff allowance matches the observed pattern; smoke fixture E-verify-before-commit.sh accepts wip:-commit + Outstanding Verification as a passing path. |
| Outcome-based verification with JSONL trace + commit-body cross-grep | Trust agent self-reports (transcript parsing only) | [CITED: dev.to/moonrunnerkc] -- agent self-reports lie systematically. Transcript-only verification is structurally insufficient; smoke fixture MUST validate empirical signal (tool_use event in trace) AND detection signal (Verified: trailer) together. |
| Smoke fixture grep + UAT replay (no grammar-constrained decoding) | Grammar-constrained decoding for pv-* XML schema | [CITED: arxiv.org/html/2509.08182v1] -- grammar-constrained decoding would close the synthesis-discipline gap deterministically at the token level, but is NOT exposed to Claude Code plugins. Smoke fixture + UAT replay is the available approximation; rejects empty/self-anchor `<evidence>` post-hoc. |
| Three-layer self-validating architecture (prompt + smoke + UAT) | Stop-hook macro validation (claudefa.st pattern) | [CITED: claudefa.st/blog/tools/hooks/self-validating-agents] -- Stop hooks would block agent completion until verification passes. PROJECT.md "no hooks for v1" precludes; the equivalent semantics live at the prompt-construction layer (advisor refuse-or-flag rule) + smoke fixture (E-verify-before-commit.sh) + UAT replay (Plan 07-06). |

**Installation:** No new dependencies. Phase 7 ships entirely as Markdown / YAML edits + Bash smoke fixtures. Existing toolchain (Bash 5+ via Git Bash, `rg` via Chocolatey, `claude -p` via Claude Code installation, Node.js for `extract-advisor-sd.mjs`) is unchanged.

**Version verification:** Phase 7 does not introduce any npm packages. The plugin manifest stays a static JSON file. Plugin version 0.9.0 -> 0.10.0 is verified per Phase 6 Plan 06-07 precedent (rg -uu -l '0\.9\.0' plugins/lz-advisor/ should return zero matches post-bump; all 5 surfaces (plugin.json + 4 SKILL.md) bump together byte-identically).

## Architecture Patterns

### Recommended Project Structure (Phase 7 changes; existing structure preserved)

```
plugins/lz-advisor/
|-- .claude-plugin/
|   '-- plugin.json              # 07-06: version 0.9.0 -> 0.10.0
|-- agents/
|   |-- advisor.md               # 07-02: refuse-or-flag rule (E.1); 07-04: sub-cap reinforcement (D)
|   |-- reviewer.md              # 07-02: refuse-or-flag rule (E.1); 07-04: sub-caps; 07-05: <verify_request> directive; 07-02: scan criterion (G)
|   '-- security-reviewer.md     # 07-02: refuse-or-flag rule (E.1); 07-04: sub-caps
|-- skills/
|   |-- lz-advisor.plan/
|   |   '-- SKILL.md             # 07-01: <context_trust_contract> ToolSearch supplement (G2 closure); 07-02: silent-resolve fix; 07-03: scope-disambiguated provenance in output template; 07-06: version bump
|   |-- lz-advisor.execute/
|   |   '-- SKILL.md             # 07-01: same trust-contract supplement; 07-02: <verify_before_commit> block (E.1+E.2); 07-03: scope-disambiguated provenance + version-qualifier cross-ref; 07-06: version bump
|   |-- lz-advisor.review/
|   |   '-- SKILL.md             # 07-01: trust-contract supplement; 07-02: review-skill scan criterion (G); 07-05: Phase 1 Class-2 enumeration + Phase 3 <verify_request> detection + re-invoke logic; 07-06: version bump
|   '-- lz-advisor.security-review/
|       '-- SKILL.md             # 07-01: trust-contract supplement; 07-03: scope-disambiguated provenance in output template; 07-06: version bump
|-- references/
|   |-- advisor-timing.md        # unchanged
|   |-- context-packaging.md     # 07-01: Common Contract Rule 5 strengthening + new pv-validation rule; 07-03: hedge propagation + version-qualifier + scope-disambiguated provenance markers
|   '-- orient-exploration.md    # 07-03: cross-skill hedge tracking section (workflow-level note)
|-- README.md                    # unchanged (deferred per CONTEXT.md)
'-- LICENSE                      # unchanged

.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/    # canonical smoke-test home
|-- KCB-economics.sh             # unchanged (or planner extends with B+H assertions)
|-- DEF-response-structure.sh    # unchanged (or planner extends with sub-cap assertions)
|-- HIA-discipline.sh            # unchanged
|-- J-narrative-isolation.sh     # unchanged
|-- D-advisor-budget.sh          # NEW (07-04)
|-- D-reviewer-budget.sh         # NEW (07-04)
|-- D-security-reviewer-budget.sh # NEW (07-04)
|-- E-verify-before-commit.sh    # NEW (07-02 + 07-06)
'-- B-pv-validation.sh           # NEW (07-01 + 07-06) OR extend KCB-economics.sh
                                 # (planner picks; existing convention: KCB owns Findings K + C + B)

.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/
|-- 07-CONTEXT.md                # exists
|-- 07-DISCUSSION-LOG.md         # exists
|-- 07-RESEARCH.md               # this file
|-- 07-RESEARCH-GAPS.md          # written by gsd-research-synthesizer if any
|-- 07-VALIDATION.md             # written by gsd-plan-phase step 5.5
|-- discuss-research/            # exists; D-03 + D-04 + D-05 anchors
|-- 07-01-PLAN.md ... 07-06-PLAN.md  # written by gsd-plan-phase
|-- 07-VERIFICATION.md           # written by gsd-verifier (Plan 07-06)
'-- uat-replay/                  # mirror of Phase 6 uat-pattern-d-replay/ shape (Plan 07-06)
    |-- runners/                 # run-all.sh, run-session.sh, tally.mjs (copy from Phase 6)
    |-- prompts/                 # session-{1..N}-<skill>.txt (planner picks scope: minimum plan-fixes + execute-fixes + security-review per Phase 6 amendment 5)
    |-- traces/                  # JSONL trace dumps
    '-- session-notes.md         # written by Plan 07-06
```

### Pattern 1: Additive content within byte-identical canon blocks

**What:** Phase 7 edits within existing `<context_trust_contract>`, `<orient_exploration_ranking>`, and Common Contract blocks rather than restructuring. New rules append to existing rule lists; new sentinels join existing sentinel sets.

**When to use:** All Phase 7 SKILL.md and references edits. The byte-identical 4-skill canon contract (Phase 5.6 Plan 06/07 + Phase 6 Plan 02) MUST be preserved; any block change applies byte-identically across all 4 SKILL.md.

**Example (Plan 07-01 ToolSearch-availability supplement):**

```markdown
<!-- existing block from Plan 06-05 -- preserved verbatim -->
ToolSearch availability rule. When the input prompt contains agent-generated source material AND the question classifies as Class 2 / 3 / 4 per `@${CLAUDE_PLUGIN_ROOT}/references/orient-exploration.md`, invoke `ToolSearch select:WebSearch,WebFetch` (or equivalent ensure-loaded mechanism) BEFORE ranking. This step fires regardless of whether the orient ranking has classified the question yet; it is a precondition for ranking, not a result of it. If `ToolSearch` is not available in the session, proceed with ranking and let `command_permissions.allowedTools` gate WebSearch / WebFetch invocation directly.

<!-- Plan 07-01 supplement -- additive only, single new paragraph -->
ToolSearch availability also fires on pv-* synthesis attempts. When you would synthesize a pv-* anchor for a claim about vendor-API behavior, framework convention, or runtime semantics (any Class 2/3/4 question per orient-exploration.md), the `<evidence>` field MUST cite a source path or URL you Read or WebFetched during this skill execution AND a verbatim tool-output excerpt (not paraphrased; not summarized). Self-anchored evidence -- e.g., `<evidence method="prior knowledge">` or `<evidence method="Nx semantics">` -- is non-conforming and MUST NOT be packaged. If your evidence cannot cite a session-grounded source, do not synthesize the pv-* block; package the claim under `## Source Material` with a verify-first marker instead.
```

[VERIFIED: existing Plan 06-05 block in `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md:53-55`]

### Pattern 2: Outcome-based verification (smoke fixture cross-grep)

**What:** Smoke fixtures grep both the JSONL trace (empirical signal) and the artifact under test (detection signal); either alone is non-conforming.

**When to use:** Any rule that depends on agent behavior + agent attribution. E-verify-before-commit.sh requires `tool_use` event for the verification action AND `Verified:` trailer in the commit body. B-pv-validation.sh requires the pv-* block AND a corresponding source-read tool_use event in the same session.

**Example (Plan 07-02 E-verify-before-commit.sh assertion):**

```bash
# Source: extends KCB-economics.sh line 28-50 pattern
# Cross-grep: empirical signal (tool_use event) AND detection signal (Verified: trailer)

# Assert (a) hedge-flag path: advisor frame "Unresolved hedge: X. Verify Y..." in advisor SD
ADVISOR_HEDGE_FLAG=0
if rg -q '"Unresolved hedge:.+\. Verify .+ before/after committing\."' "$SD_FILE"; then
  ADVISOR_HEDGE_FLAG=1
fi

# Assert (b) verify-trailer path: tool_use event for verification action in trace AND Verified: trailer in commit body
TOOL_USE_BASH=0
TRAILER_PRESENT=0
if rg -q '"name":"Bash"' "$JSONL_TRACE"; then
  TOOL_USE_BASH=1
fi
if git log -1 --format='%B' | rg -q '^Verified:'; then
  TRAILER_PRESENT=1
fi

# Assert (c) wip-commit path: wip: prefix AND ## Outstanding Verification section in body
WIP_PREFIX=0
OUTSTANDING_SECTION=0
if git log -1 --format='%s' | rg -q '^wip:'; then
  WIP_PREFIX=1
fi
if git log -1 --format='%B' | rg -q '^## Outstanding Verification'; then
  OUTSTANDING_SECTION=1
fi

# Pass if any of the three paths is fully satisfied
if [ "$ADVISOR_HEDGE_FLAG" -eq 1 ]; then
  echo "[OK] E.1 hedge-flag path: advisor surfaced unresolved hedge"
elif [ "$TOOL_USE_BASH" -eq 1 ] && [ "$TRAILER_PRESENT" -eq 1 ]; then
  echo "[OK] E.2 verify-trailer path: tool_use for Bash + Verified: trailer in commit"
elif [ "$WIP_PREFIX" -eq 1 ] && [ "$OUTSTANDING_SECTION" -eq 1 ]; then
  echo "[OK] E.3 cost-cliff path: wip: commit + Outstanding Verification section"
else
  echo "[ERROR] No verify-skip path satisfied: hedge_flag=$ADVISOR_HEDGE_FLAG, tool_use=$TOOL_USE_BASH, trailer=$TRAILER_PRESENT, wip=$WIP_PREFIX, outstanding=$OUTSTANDING_SECTION"
  FAIL=1
fi
```

[VERIFIED: pattern derived from `KCB-economics.sh:28-50` JSONL grep + `DEF-response-structure.sh:60-65` SD-extraction pattern]

### Pattern 3: Source-provenance + question-class branching

**What:** Phase 6 Plan 06-05 + 06-06 established a 2-D classification (source provenance: vendor-doc vs agent-generated; question class: 1 / 2 / 2-S / 3 / 4). Phase 7 extends with a third dimension (verdict scope: api-correctness / security-threats / performance / accessibility) per Plan 07-03 guard 4.

**When to use:** Plan 07-03 scope-disambiguated provenance markers. Each SKILL.md output template gains a verdict tag; downstream skills check scope-match before treating as authoritative.

**Example (Plan 07-03 scope tag in lz-advisor.review/SKILL.md output template):**

```markdown
<!-- additive section in <output> Phase 3 -->
### Verdict Scope Tag

After the `### Cross-Cutting Patterns` section, append a single-line scope tag:

> Scope: api-correctness

The tag declares what question class this verdict covers. For lz-advisor.review the scope is always `api-correctness` (code quality / correctness / edge cases). For lz-advisor.security-review the scope is `security-threats`. Downstream skills reading the verdict MUST check scope-match before treating it as authoritative for the question they are answering.
```

### Anti-Patterns to Avoid

- **Restructuring byte-identical canon blocks.** Plan 07-01's pv-validation supplement, Plan 07-03's hedge-propagation rule, and Plan 07-04's sub-caps add content within existing blocks. Do not move, rename, or refactor. The byte-identical 4-skill canon contract is load-bearing.
- **Iterative reviewer re-invoke loop.** [CITED: dev.to/moonrunnerkc Spotify Honk] -- one-shot pass/fail prevents the reviewer from gaming verifier feedback. Plan 07-05 reviewer escalation is one-shot only; if the first re-invoke still surfaces the same hedge, emit ungrounded finding with explicit "verification unsuccessful" tag and stop.
- **Trusting agent self-reports as verification.** [CITED: dev.to/moonrunnerkc 5-check model] -- transcript parsing is `required: false`. The `Verified:` trailer convention is detection-only; the smoke fixture MUST validate the empirical tool_use signal AND the trailer.
- **Imperatives in non-safety-critical rules.** [CITED: prompthub.us/blog Claude 4 system prompt analysis] -- ALL-CAPS reserved for safety-critical ("MUST refuse"); Phase 7 word-budget rules use descriptive triggers + worked example. Existing Common Contract Rules 5/5a/6 stay imperative; word-budget joins descriptive layer.
- **Treating pv-* citations as proof of groundedness.** [CITED: whyaitech.com/notes/systems-note-002] -- citations create "illusion of groundedness" because models confabulate "hallucinated bridges". Plan 07-01's pv-validation rule MUST operate on `<evidence>` content, not just `<pre_verified>` tag presence. Reject empty `<evidence>` and self-anchor evidence (e.g., `method="Nx semantics"`).
- **Promoting hedged claims into "Pre-verified Claims" header.** [VERIFIED: plan-fixes UAT session `26868ae7-...` event 38] -- this was the exact failure mode of Finding B.2. The Plan 07-03 hedge-propagation rule forbids: when source contains a verify-first marker, the executor MUST either resolve via verification action OR carry verbatim into `## Source Material`; packaging under `## Pre-verified Claims` is non-conforming.
- **Stripping version qualifiers without empirical anchoring.** [VERIFIED: 7-hop chain in PHASE-7-CANDIDATES.md line 290-302] -- "Storybook 8+" propagated through 7 hops with zero empirical grounding. Plan 07-03 version-qualifier rule: read package.json; either `pv-version-anchor` block OR strip-and-replace with empirically observed version.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XML schema validation for pv-* blocks | Custom XML parser in plugin code | Smoke-fixture regex over stdout traces (Bash + `rg`) | Plugin has zero-dependency constraint; no XML library available; Git Bash + `rg` regex is the canonical smoke-fixture pattern (`KCB-economics.sh:45` already uses `rg -q "<pre_verified source="`); grammar-constrained decoding [CITED: arxiv.org/html/2509.08182v1] is unavailable in Claude Code |
| Cross-skill state tracking | Shared session memory or hook-based state | Prompt-layer `## Source Material` carry-forward + Plan 06-05 hedge-marker preservation regex | Skills are stateless; "no hooks for v1" PROJECT.md constraint precludes runtime memory; the only shared surface is the consultation prompt; Phase 6 Plan 06-05 already establishes the carry-forward pattern empirically robust across 8 UATs |
| Verification gate (Stop-hook semantics) | Stop-hook for blocking commit on hedge-marker survival | Advisor refuse-or-flag rule (E.1) + smoke fixture E-verify-before-commit.sh + UAT replay | "no hooks for v1" precludes runtime enforcement; [CITED: claudefa.st/blog/tools/hooks/self-validating-agents] three-layer architecture maps to prompt + smoke + UAT (validated Phase 6 amendment 5 precedent) |
| Reviewer privilege escalation | Extend reviewer tool grant with `WebSearch`/`WebFetch` | `<verify_request>` structured output + executor-as-privileged-surface (Plan 07-05 Option 2) | [CITED: OWASP AI Agent Security Cheat Sheet], [CITED: arxiv.org/html/2601.11893v1], [CITED: github.com/anthropics/claude-code/issues/20264] -- subagent tool-grant inheritance is a documented escalation risk |
| Conventional-commits `wip:` parser | Custom commit-message linter | Existing `git log` + `rg` pattern matching in smoke fixtures | [CITED: github.com/conventional-commits/conventionalcommits.org/issues/38, /issues/137] -- `wip:` is a community-adopted extension, not part of the official spec; project doesn't currently use commitlint; smoke fixture grep is sufficient |
| Trailer parsing | Custom git-log parser | `git log -1 --format='%B' \| rg '^Verified:'` (post-trim, follows trailer-section convention) | [CITED: git-scm.com/docs/git-interpret-trailers] -- trailer format is RFC-822-like, key/value with `:` separator; `git interpret-trailers --parse` available but adds complexity; simple `rg '^Verified:'` suffices for detection signal |
| Iterative groundedness check | Multi-round retrieval-rerank loop | One-shot pass/fail: smoke fixture validates pv-* `<evidence>` against session-grounded sources; UAT replay validates end-to-end | [CITED: dev.to/moonrunnerkc Spotify Honk] -- one-shot prevents agent from gaming verifier; multi-round is deferred per CONTEXT.md |

**Key insight:** The plugin's "zero external dependencies + no hooks for v1" constraint forces all enforcement to the prompt-construction layer (advisor refuse-or-flag rule, pv-validation rule, hedge propagation rule) plus post-hoc validation (smoke fixtures, UAT replay). This is structurally different from the canonical claudefa.st three-layer architecture (which assumes hook availability), but the semantic equivalents are achievable: prompt-layer rule = micro layer; smoke fixture = macro layer; UAT replay = team layer. Phase 7's job is to ship the prompt-layer rules paired with smoke fixtures (per Phase 5.4 D-15 / 5.6 D-03+D-05 / 6 D-03+D-04 precedent) rather than reach for a non-available enforcement primitive.

## Common Pitfalls

### Pitfall 1: Self-anchor confabulation (Finding H, the load-bearing root cause)

**What goes wrong:** Executor's orient phase classifies a claim as already-known framework knowledge ("Nx semantics", "lockfile gates malicious bumps", "ignore-scripts=true applies to all packages") and synthesizes a pv-* block with `<evidence method="...">` referring to claimed knowledge rather than to a session-grounded source-read or WebFetch. The trust-contract carve-out fires correctly (executor explicitly classifies input as agent-generated) but routes away from "trust agent-generated source" without routing toward "do empirical verification" -- the executor takes a third path (self-anchor) the carve-out doesn't close.

**Why it happens:** Sonnet 4.6 has high confidence on framework/runtime claims that overlap with training data. The trust-contract's two-classification routing (vendor-doc vs agent-generated) implicitly assumes the third path doesn't exist. Empirically, the third path dominates in 6 of 6 plan-file fixture replays on plugin 0.9.0.

**How to avoid:** Plan 07-01's pv-validation rule operates on `<evidence>` content, not just block presence. Require source path or URL Read or WebFetched in this skill execution + verbatim tool-output excerpt. Self-anchor methods (`method="prior knowledge"`, `method="claimed knowledge"`, `method="<framework> semantics"`) are structurally non-conforming and MUST be rejected by the smoke fixture. [CITED: whyaitech.com/notes/systems-note-002] -- this is the RAG groundedness trap formalized for the plugin's pv-* contract.

**Warning signs:** pv-* block with `<evidence>` content shorter than ~10 words; `<evidence method="...">` value containing words like "knowledge", "semantics", "prior", "documentation states" (without URL); `<pre_verified source="...">` pointing at a non-file-path string (e.g., `source="Nx documentation"` rather than `source="https://nx.dev/...`); session JSONL trace contains zero `tool_use` events for the time window when the pv-* was synthesized.

### Pitfall 2: Hedge-marker stripping during cross-skill packaging (Finding C, 7-hop chain)

**What goes wrong:** Upstream skill (review) flags claim with `Verify X before acting` hedge. Downstream skill (plan-fixes) packages the same claim under `## Pre-verified Claims` header without the hedge marker. Each hop strips a layer; by hop 7 the originally-flagged unverified claim is committed source code with an unverified provenance.

**Why it happens:** The hedge marker is a verbal hedge, not a structural constraint. The plan-fixes executor's orient phase interprets the review's content as "what was found" (numbered findings + recommendations) and naturally re-frames the recommendations as plan steps; in the re-framing, the verb "Verify" gets dropped because the plan-step shape doesn't have a slot for it.

**How to avoid:** Plan 07-03 hedge-propagation rule (Common Contract): the executor MUST either (a) perform the verification step and replace the marker with an evidence citation, or (b) carry the marker verbatim into `## Source Material`, forbidden from packaging the same content under `## Pre-verified Claims`. Plan 07-03 cross-skill hedge tracking (`references/orient-exploration.md`): workflow-level note that successive skills MUST NOT strip verify-first markers introduced by upstream skills.

**Warning signs:** Plan-skill output with confident assertions on questions that the input review/plan flagged with `verify`, `assuming`, `unverified`, `confirm`, or `before acting` markers; consultation prompt's `## Pre-verified Claims` section containing content that appears in the input under a hedge frame; commit body lacking `Verified:` trailers for claims that propagate forward across skill invocations.

### Pitfall 3: Version qualifier injection (subset of Pitfall 2)

**What goes wrong:** Advisor introduces version qualifier ("Storybook 8+") not present in upstream sources. Executor accepts the qualifier as authoritative and propagates into commits. Implementation works empirically (Storybook 10.3.5 happens to support fn() in args), so the chain provides positive feedback that verification skip was harmless -- training future executors to skip verification.

**Why it happens:** Training-data bleed on version-aware claims. Sonnet 4.6 / Opus 4.7 have version-aware information from training; lacking a session-grounded reason to verify against the actual installed version, the model emits the qualifier with high confidence.

**How to avoid:** Plan 07-03 version-qualifier anchoring rule (Common Contract): when an upstream artifact introduces a version qualifier for a vendor library (e.g., "Storybook 8+", "Angular 17+", "TypeScript 5+"), the executor MUST verify the qualifier against the installed version before propagating into the consultation prompt. Mechanism: read the relevant `package.json` (or equivalent dependency manifest) for the actual installed version; either confirm the qualifier matches and synthesize a `pv-version-anchor` block, or strip the qualifier and replace with the empirically observed version.

**Warning signs:** Consultation prompt or plan output containing version qualifiers (`<library> N+`, `<library> >= N`) without a corresponding `pv-version-anchor` block; package.json read events absent from the JSONL trace despite version-qualified claims in the consultation; positive-feedback chains (tests pass, lint passes) on claims that lack empirical version anchoring.

### Pitfall 4: Word-budget regression on representative inputs

**What goes wrong:** Reviewer / security-reviewer outputs land 37-46% over the 300w cap on representative scan inputs. Existing word-budget contract (in agent prompt prose) is descriptive but not load-bearing; the agent prioritizes Threat Patterns / Cross-Cutting Patterns content over budget compliance.

**Why it happens:** Threat Patterns / Cross-Cutting Patterns sections are inherently multi-finding-spanning narratives; the existing 100-150w budget for that section conflicts with the legitimate need to articulate attack chains across 3-5 findings. Without sub-caps, the section bleeds over and pulls the total above the 300w aggregate cap.

**How to avoid:** Plan 07-04 hybrid pattern: descriptive triggers + worked example + structural sub-caps. Sub-caps for reviewer.md and security-reviewer.md: each Findings block <=80w, Threat Patterns <=160w, Missed-surfaces <=30w, total <=300w. Per-agent smoke fixtures (D-{advisor,reviewer,security-reviewer}-budget.sh) parse outputs by section header regex and assert per-section counts. Closure criterion: all three smoke fixtures green on plugin 0.10.0.

**Warning signs:** Smoke fixture output shows Findings + Threat Patterns total > 300w; per-section count exceeds sub-cap (Findings > 80w each, Threat Patterns > 160w); UAT replay session captures advisor SD > 100w on representative inputs.

### Pitfall 5: Cost-cliff at long-running validation (Finding E.2)

**What goes wrong:** Plan step structured as `Run: pnpm nx storybook ngx-smart-components` (5+ minute dev-server startup) gets skipped because it's expensive. Cheap synchronous Run directives (`npm install`, `git status`, `git check-ignore`) execute reliably; long-running async ones don't.

**Why it happens:** The 8th UAT empirical pattern: 3 of 4 cheap directives ran; 1 long-running skipped. Sonnet 4.6 + Opus 4.7 follow short cheap directives reliably and defer expensive ones; the deferral is a rational time-budget trade-off, not a discipline failure.

**How to avoid:** Plan 07-02 Element 3 cost-cliff allowance: cheap synchronous validations execute pre-commit; long-running async (full test suite, dev server startup, nx run-many over many projects) move to `wip:` prefixed commit + `## Outstanding Verification` section in commit body. Smoke fixture E-verify-before-commit.sh accepts wip:-commit + Outstanding Verification as a passing path. Threshold heuristic for "cheap vs long-running" is Claude's Discretion for the planner (suggested: command-name pattern with explicit override list `nx storybook`, `nx test*`, `nx serve*`, full test suites).

**Warning signs:** Plan steps with `Run: <long-running-command>` directives; commits without `Verified:` trailers OR `wip:` prefix when plan input contained explicit Run/Verify directives; JSONL trace shows partial verification (some Bash invocations for cheap directives, none for long-running).

### Pitfall 6: Silent-resolve sub-pattern (plan SKILL.md)

**What goes wrong:** Plan-skill receives N numbered input findings; produces plan addressing M of N (M < N) without acknowledging the dropped findings. 7th UAT empirical instance: plan-fixes-2 dropped F3 + F4 from security-review's 5-finding input even though both were Low+no-action per security-reviewer disposition.

**Why it happens:** Plan SKILL.md output convention currently has no rule requiring explicit disposition for ALL numbered input findings. The plan author treats Low+no-action findings as out-of-scope without surfacing the decision.

**How to avoid:** Plan 07-02 silent-resolve fix: plan-skill output convention requiring explicit disposition for ALL numbered input findings. Each input finding gets one of: (a) addressed in plan steps with cross-reference, (b) explicitly marked as out-of-scope with rationale, (c) explicitly marked as deferred with deferral target.

**Warning signs:** Plan output contains fewer addressed findings than input contains numbered findings; no `## Findings Disposition` section enumerating each input finding's status; UAT trace shows plan author skipping over numbered input items without acknowledgment.

## Code Examples

### Example 1: pv-* validation rule (Plan 07-01, additive content within Common Contract Rule 5)

```markdown
<!-- Source: extends plugins/lz-advisor/references/context-packaging.md Rule 5 -->

5. **Verify your external claims before consulting.** [existing text preserved verbatim]

   **5b. pv-* synthesis discipline (NEW, Plan 07-01).**

   Every `<pre_verified>` block MUST satisfy three structural requirements; smoke fixture B-pv-validation.sh enforces them post-hoc on plan / execute consultation packages:

   1. **XML format mandate.** Plain-bullet "Pre-verified Claims" sections are non-conforming. Use the canonical XML shape:

      ```xml
      <pre_verified source="<URL or absolute file path>" claim_id="pv-N">
        <claim>One-sentence factual assertion about library/framework/API behavior.</claim>
        <evidence method="<WebFetch|WebSearch|Read|Glob>">
          Verbatim tool-output excerpt -- not paraphrased, not summarized.
        </evidence>
      </pre_verified>
      ```

   2. **Source-grounded `<evidence>`.** The `<evidence>` content MUST cite a source the executor Read or WebFetched during this skill execution. Self-anchored evidence -- e.g., `<evidence method="prior knowledge">`, `<evidence method="Nx semantics">`, `<evidence method="claimed knowledge">` -- is non-conforming. If your evidence cannot cite a session-grounded source, do not synthesize the pv-* block; package the claim under `## Source Material` with a verify-first marker instead.

   3. **Verbatim tool-output excerpt.** The `<evidence>` body MUST contain the verbatim text the tool returned (under approximately 200 words; longer excerpts can be truncated with `[...]` markers). Paraphrases, summaries, and "based on docs" framing are non-conforming -- they sever the empirical anchor that makes pv-* trustworthy.

   The smoke fixture rejects:
   - Empty `<evidence>` blocks (regex: `<evidence[^>]*>\s*</evidence>`)
   - Self-anchor methods (regex: `method="(prior knowledge|claimed knowledge|.+ semantics|prior context)"`)
   - Source paths without URL or file-path shape (regex: `source="(?!https?://|/|\.\.?/|node_modules/|src/|.+\.(json|md|ts|tsx|js|mjs|cjs|d\.ts))"`)
```

[VERIFIED: pattern derived from existing `references/context-packaging.md:107-120` pv-* shape; XML format anchored in [CITED: platform.claude.com/docs/en/build-with-claude/prompt-engineering/use-xml-tags]]

### Example 2: Advisor refuse-or-flag rule (Plan 07-02 Element 1, additive content within agents/advisor.md Output Constraint)

```markdown
<!-- Source: extends plugins/lz-advisor/agents/advisor.md ## Output Constraint section -->

[existing Output Constraint text preserved verbatim through line 75]

## Verify-Before-Commit Discipline (Plan 07-02 Element 1)

When the consultation source material contains an unresolved verify-first marker on a load-bearing implementation choice, your Strategic Direction (or numbered-item answer) MUST flag the unresolved hedge with the literal frame:

`Unresolved hedge: <marker text>. Verify <action> before/after committing.`

Sentinel regex set the executor preserves into the consultation per Common Contract Rule 5 (Phase 6 Plan 06-05):

- `\b(unverified)\b`
- `\bverify .+ before acting\b`
- `\bAssuming .+ \(unverified\)\b`
- `\bconfirm .+ before\b`
- `\bfall back to .+ if .+\b`

When source material contains any of these patterns AND the marker covers a load-bearing implementation choice (a choice the recommendation depends on for correctness), include the literal "Unresolved hedge: ..." frame as an enumerated item OR as a `**Critical:**` block. Do not silently resolve the hedge; do not paraphrase the frame; do not bury the marker in a parenthetical.

The frame routes the executor's behavior: it triggers either pre-commit empirical verification (Element 2 Run/Verify execution) OR post-commit verification with `wip:` commit + `## Outstanding Verification` section (Element 3 cost-cliff allowance). Both are passing paths under smoke fixture E-verify-before-commit.sh.

Worked example (advisor refuse-or-flag fires on an inherited hedge):

> 1. Add `dismissed: fn()` to both `Primary.args` and `Heading.args`. Verify the test-storybook play function asserts `toHaveBeenCalled()` after wiring.
> 2. **Unresolved hedge:** "Verify Storybook Angular version behavior before acting." **Verify** the installed `@storybook/angular` version exports `fn` from `storybook/test` before committing.
> 3. ...
```

[VERIFIED: empirical anchor in 8th UAT session `188bac4f-...` -- advisor Critical block on Husky triggered `npm ls husky` + `git grep postinstall` empirical verification; Plan 07-02 makes this RELIABLE rather than incidental]

### Example 3: pv-* validation smoke fixture (Plan 07-01 + 07-06, B-pv-validation.sh extract)

```bash
#!/usr/bin/env bash
# Source: extends KCB-economics.sh structural assertion pattern (lines 28-50)
# Smoke test for Findings B.1 + B.2 + H -- pv-* synthesis discipline:
#   B.1: pv-* block synthesized for orient-phase empirical findings (>=1 per material Read or WebFetch)
#   B.2: pv-* uses canonical XML format (not plain-bullet "Pre-verified Claims" header)
#   H: pv-* <evidence> cites session-grounded source (not self-anchor)
set -eu

PLUGIN_DIR="$(git rev-parse --show-toplevel)/plugins/lz-advisor"
SCRATCH="$(mktemp -d -t lz-advisor-pv-XXXX)"
trap 'rm -rf "$SCRATCH"' EXIT

cd "$SCRATCH"
git init -q
git commit -q --allow-empty -m "seed"

# Synthesize a Class-2 fixture: question with version qualifier requiring empirical anchor
mkdir -p src .storybook
printf '{"name":"fixture","dependencies":{"@storybook/angular":"10.3.5"}}\n' > package.json
git add package.json
git commit -q -m "seed package.json"

OUT="$SCRATCH/B-output.txt"
JSONL="$SCRATCH/B-output.jsonl"

claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
  --dangerously-skip-permissions \
  -p "/lz-advisor.plan Set up Compodoc for this Storybook 8+ project. Verify the @storybook/angular version supports the integration before acting." \
  --verbose --output-format stream-json > "$JSONL" 2>&1 || true

cp "$JSONL" "$OUT"  # parallel copy for stdout-style assertions

FAIL=0

# Assertion 1: pv-* block uses XML format (not plain-bullet)
PV_XML_COUNT=$(rg -c '<pre_verified source=' "$OUT" || echo 0)
PV_BULLET_COUNT=$(rg -c '^- (Pre-verified|pv-)' "$OUT" || echo 0)

if [ "$PV_XML_COUNT" -ge 1 ] && [ "$PV_BULLET_COUNT" -eq 0 ]; then
  echo "[OK] B.2: pv-* uses canonical XML format ($PV_XML_COUNT XML blocks, 0 plain-bullet)"
else
  echo "[ERROR] B.2: pv-* shape violation -- XML=$PV_XML_COUNT bullet=$PV_BULLET_COUNT"
  FAIL=1
fi

# Assertion 2: synthesis mandate -- >=1 pv-* per material Read or WebFetch (orient-phase empirical findings)
TOOL_USE_COUNT=$(rg -c '"name":"(Read|WebFetch|WebSearch|Bash)"' "$JSONL" || echo 0)
PV_SYNTH_COUNT=$(rg -c '<pre_verified source=' "$JSONL" || echo 0)

if [ "$TOOL_USE_COUNT" -ge 1 ] && [ "$PV_SYNTH_COUNT" -ge 1 ]; then
  echo "[OK] B.1: synthesis fired ($PV_SYNTH_COUNT pv-* on $TOOL_USE_COUNT tool_use events)"
else
  echo "[ERROR] B.1: synthesis gap -- tool_use=$TOOL_USE_COUNT pv=$PV_SYNTH_COUNT"
  FAIL=1
fi

# Assertion 3: Finding H -- <evidence> cites session-grounded source (no self-anchor)
SELF_ANCHOR_COUNT=$(rg -c 'method="(prior knowledge|claimed knowledge|.+ semantics|prior context)"' "$JSONL" || echo 0)

if [ "$SELF_ANCHOR_COUNT" -eq 0 ]; then
  echo "[OK] H: no self-anchor evidence (session-grounded sources only)"
else
  echo "[ERROR] H: $SELF_ANCHOR_COUNT self-anchor evidence blocks (must be 0)"
  rg 'method="(prior knowledge|claimed knowledge|.+ semantics|prior context)"' "$JSONL" || true
  FAIL=1
fi

# Assertion 4: empty <evidence> rejection
EMPTY_EVIDENCE_COUNT=$(rg -c '<evidence[^>]*>\s*</evidence>' "$JSONL" || echo 0)

if [ "$EMPTY_EVIDENCE_COUNT" -eq 0 ]; then
  echo "[OK] H: no empty <evidence> blocks"
else
  echo "[ERROR] H: $EMPTY_EVIDENCE_COUNT empty <evidence> blocks (must be 0)"
  FAIL=1
fi

# Assertion 5 (G2 closure): ToolSearch fires on agent-generated source w/ Class-2 question
# Note: this fixture's input is Class-2 (API currency) but is direct user prompt, not agent-generated.
# The G2 closure assertion lives in the Plan 07-06 UAT replay, not here.

if [ "$FAIL" -ne 0 ]; then
  echo "--- JSONL trace tail (last 200 lines) ---"
  tail -n 200 "$JSONL"
  exit 1
fi

echo "[SUCCESS] B + H smoke tests passed"
```

[VERIFIED: extends `KCB-economics.sh:28-50` JSONL grep pattern; pattern matches existing `extract-advisor-sd.mjs` JSONL parsing convention]

### Example 4: Reviewer escalation hook structured-output (Plan 07-05 Option 2, additive content within agents/reviewer.md)

```markdown
<!-- Source: extends plugins/lz-advisor/agents/reviewer.md system prompt -->

[existing Output Constraint, Severity Classification, Context Trust Contract sections preserved]

## Class-2 Verification Escalation (Plan 07-05 Option 2)

Your tool grant is `["Read", "Glob"]` (no web tools by design; principle of least privilege per OWASP). When you encounter a finding that requires Class-2 (API currency) or Class-3 (migration / deprecation) verification beyond what the executor's pre-emptive Class-2 scan resolved, emit a structured `<verify_request>` block in your response. The executor parses this block, performs the verification (it has WebSearch / WebFetch in its tool grant), and re-invokes you ONCE with the new pv-* anchor.

Schema:

```xml
<verify_request question="<one-sentence question>" class="<2|3>" anchor_target="pv-<N>" severity="<Critical|Important|Suggestion>" />
```

Place the `<verify_request>` block AFTER your `### Cross-Cutting Patterns` section. The executor detects these blocks and resolves them before final user output.

Worked example (reviewer cannot self-verify Class-2 question):

```
### Findings

1. ...

### Cross-Cutting Patterns

The findings share a root cause in Storybook docs configuration. Whether the `tags: ['autodocs']` shape requires `framework: '@storybook/angular'` is unresolved -- the codebase doesn't show an example.

<verify_request question="Does Storybook 10.3.5 require framework: '@storybook/angular' for tags: ['autodocs'] to enable Compodoc rendering?" class="2" anchor_target="pv-autodocs-framework" severity="Important" />
```

The executor performs WebSearch + WebFetch, synthesizes `pv-autodocs-framework` per Common Contract Rule 5, and re-invokes you with the new anchor in the consultation prompt. You then close the hedge in the re-invoke response.

This is one-shot only (Spotify Honk principle): if the first re-invoke does not resolve the hedge, do not emit another `<verify_request>`; emit an ungrounded finding with explicit "verification unsuccessful" tag and stop. Iterative re-invoke loops are deferred per CONTEXT.md.
```

[VERIFIED: schema design anchored in [CITED: infoq.com/articles/building-ai-agent-gateway-mcp] structured-output security control + [CITED: cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html] structured-output enforcement]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Trust agent self-reports in commit messages / transcripts | Outcome-based verification (5-check model: git_diff + build_exec + test_exec + file_existence + transcript[demoted]) | [CITED: dev.to/moonrunnerkc 2026-04] | Phase 7 Verified: trailer is detection-only; smoke fixture validates empirical signal AND detection signal together |
| Citation-based RAG groundedness | Atomic-claim verification + Groundedness Score | [CITED: TruLens RAG Triad, whyaitech.com/notes/systems-note-002 2026] | Phase 7 pv-validation rule operates on `<evidence>` content (atomic-claim level), not `<pre_verified>` tag presence; rejects "hallucinated bridges" between fragments |
| Hard-rules layer for output length / format / safety | Layered approach: hard cap (max_tokens) + soft system prompt + structured output | [CITED: Blockchain Council Claude Output Control 2026] | Phase 7 D-03 hybrid: descriptive triggers + worked example + structural sub-caps + smoke fixture; Anthropic's Apr 2026 ablation shows ~3% coding-quality cost from hard-rules cap addition |
| Iterative agent verification loops | One-shot pass/fail (Spotify Honk principle) | [CITED: dev.to/moonrunnerkc 2026-04, Spotify Honk production] | Phase 7 reviewer escalation hook is one-shot only; multi-round verification is a future enhancement if empirical data shows insufficiency |
| Subagent privilege inheritance / tool-grant extension | Structured-output escalation + executor-as-privileged-surface | [CITED: OWASP AI Agent Security Cheat Sheet 2026, arxiv.org/html/2601.11893v1, github.com/anthropics/claude-code/issues/20264] | Phase 7 reviewer keeps `[Read, Glob]`; `<verify_request>` structured output + executor (which has WebSearch/WebFetch) is the privilege boundary |
| Stop-hook macro validation | Prompt-layer rule + smoke fixture + UAT replay (no-hooks adaptation) | [CITED: claudefa.st/blog/tools/hooks/self-validating-agents 2026], adapted per "no hooks for v1" constraint | Phase 7 advisor refuse-or-flag rule is the prompt-layer micro layer; E-verify-before-commit.sh is the macro layer; UAT replay is the team layer |
| Imperative "MUST" / "ALL-CAPS" for tool-use steering on Claude 4.x | Descriptive triggers + worked example + few-shot pattern | [CITED: prompthub.us/blog Claude 4 system prompt analysis 2025-05-25, anthropic.com/engineering/writing-tools-for-agents] | Phase 7 D-03 word-budget rules use descriptive triggers; Common Contract Rules 5/5a/6 stay imperative (safety-critical); word-budget joins descriptive layer |

**Deprecated/outdated:**

- **Plain-bullet "Pre-verified Claims" sections.** Phase 7 Plan 07-01 makes the canonical `<pre_verified source="..." claim_id="..."><claim>...</claim><evidence method="...">...</evidence></pre_verified>` XML format mandatory. Plain-bullet sections under a "Pre-verified Claims" header are non-conforming and structurally rejected by the smoke fixture.
- **"Rule miss" interpretation of G1+G2 empirical residual.** Phase 6 amendment 5 (06-VERIFICATION.md) interpreted the residual as ToolSearch-availability rule not firing. Phase 7 Finding H refines the root cause: rule bypass via self-anchor on claimed framework knowledge. The fix surface shifts from "make ToolSearch fire" to "make pv-* synthesis structurally reject self-anchor evidence".
- **Single-trial empirical confirmation as resolution criterion.** Phase 7 Finding A status: n=1 in-skill confirmation of override-acceptance pathway is NOT sufficient. Promoting Finding A to "resolved" requires n>=3 trials across heterogeneous override scenarios. Until Plan 07-06 UAT replay produces n>=3, Finding A remains in scope as "single-trial empirical confirmation; needs more trials".

## Assumptions Log

> All claims tagged `[ASSUMED]` -- decisions that need user confirmation before execution.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `<verify_request>` block schema uses XML self-closing tag with attributes (`<verify_request question="..." class="..." anchor_target="..." />`) rather than open-close tag with body | Code Examples Pattern 4 | LOW -- schema is Claude's Discretion per CONTEXT.md; planner picks; both shapes are parseable; documented in `references/context-packaging.md` |
| A2 | The smoke fixture B-pv-validation.sh extracts pv-* blocks from JSONL `tool_use` content, not from `tool_result` content | Code Examples Pattern 3 | MEDIUM -- if the executor's consultation prompt is not captured at the `tool_use` level, the smoke fixture will report 0 pv-* blocks; planner should verify the JSONL shape against an existing successful pv-* synthesis trace before finalizing the assertion regex |
| A3 | The `wip:` commit prefix convention follows community-adopted pattern (lowercase `wip:`, optional compound form `wip(<scope>):`); not enforced by commitlint in this project | Pitfall 5, Pattern 2 example | LOW -- planner picks per CONTEXT.md Claude's Discretion; alternative `chore(wip):` is acceptable; project doesn't currently use commitlint so format is advisory |
| A4 | The `Verified:` trailer follows git interpret-trailers convention (capitalized key, `:` separator, value follows); detected via `git log -1 --format='%B' \| rg '^Verified:'` | Pattern 2 example | LOW -- trailer format is RFC-822-like and well-established; `git interpret-trailers --parse` is available if simpler regex proves insufficient |
| A5 | The per-section sub-cap thresholds (Findings <=80w, Threat Patterns <=160w, Missed-surfaces <=30w, total <=300w) are a reasonable starting point but may need calibration based on observed structural breakdown of representative reviewer / security-reviewer outputs | D-03, Pitfall 4 | MEDIUM -- if 80w is too tight for typical Findings entries (4 findings * 80w = 320w > 300w aggregate cap), the planner must adjust either the sub-cap or the aggregate cap; recommend the planner extract section-level word counts from Phase 6 06-VERIFICATION.md amendment 5 fixtures before finalizing |
| A6 | `B-pv-validation.sh` ships as a NEW fixture rather than extending `KCB-economics.sh` | Standard Stack | LOW -- planner picks per CONTEXT.md Claude's Discretion; existing convention has KCB owning Findings K + C + B; planner may elect to extend KCB rather than ship new fixture |
| A7 | Plan 07-06 UAT replay scope = minimum plan-fixes + execute-fixes + security-review (Phase 6 amendment 5 precedent), not full 8-skill chain | Validation Architecture | LOW -- planner picks per CONTEXT.md Claude's Discretion; full 8-skill chain is recommended only if context budget allows |
| A8 | Plan 07-05 reviewer re-invoke behavior on first re-invoke not resolving: emit ungrounded finding with explicit "verification unsuccessful" tag; do NOT loop | Standard Stack, Pattern 4 | LOW -- planner picks per CONTEXT.md Claude's Discretion; alternative is multi-round but deferred per Spotify Honk one-shot principle |
| A9 | Plan ordering 07-04 / 07-05 vs 07-02 / 07-03 after 07-01: any order acceptable; planner may parallelize or serialize based on commit-revert preference | Validation Architecture | LOW -- D-01 explicitly says "any order after 07-01"; ordering choice is operational, not structural |

**If user disagrees with any assumed claim above, signal in /gsd-discuss-phase iteration before plan execution.** The 9 assumptions are all bounded-risk choices within the discretion CONTEXT.md grants the planner; none changes the load-bearing fix architecture.

## Open Questions

1. **JSONL trace shape for pv-* extraction.**
   - What we know: `KCB-economics.sh:45` greps the entire stdout for `<pre_verified source=`; works because the executor's consultation prompt appears as a `tool_use` content block in the JSONL stream.
   - What's unclear: whether the smoke fixture should use `tool_use` content blocks or `tool_result` content blocks for the pv-* extraction; whether grepping the full stream-json output (mixing user-visible output, tool_use content, and tool_result content) produces false positives from documentation comments referencing pv-* shape.
   - Recommendation: Plan 07-01 implementation should validate the assertion regex against an existing successful pv-* synthesis trace (Phase 6 amendment 1 plugin 0.8.9 plan-skill UAT, session `6cba971a-...`, which produced 4 pv-* blocks) before locking the regex; if false positives occur, scope the grep to `tool_use` content blocks via `node` script (existing `extract-advisor-sd.mjs` precedent).

2. **Word-budget sub-cap thresholds calibration.**
   - What we know: Findings + Threat Patterns total runs 411-438w on representative inputs (37-46% over 300w cap).
   - What's unclear: whether the suggested 80w / 160w / 30w sub-caps are achievable given the legitimate need to articulate attack chains; whether the aggregate cap should rise to 400w with stricter sub-caps, or stay at 300w with tighter sub-caps.
   - Recommendation: Plan 07-04 implementation should extract per-section word counts from the Phase 6 amendment 5 fixtures (security-reviewer 412w on 0.8.9, 438w on 0.9.0; reviewer 411w on 0.9.0) and calibrate sub-caps so the aggregate works empirically. If a per-finding 80w cap forces 4-finding outputs to 320w (> 300w cap), the planner should either tighten Findings to 70w or raise aggregate to 320w.

3. **Cost-cliff threshold heuristic for E.2.**
   - What we know: The 8th UAT empirical pattern (3 of 4 cheap directives ran; 1 long-running skipped) is the load-bearing data point. CONTEXT.md suggests command-name pattern with explicit override list (`nx storybook`, `nx test*`, `nx serve*`, full test suites).
   - What's unclear: whether the heuristic should be timeout-based (commands expected to complete in <30 seconds run pre-commit) OR command-name pattern (explicit override list) OR explicit plan annotation (planner marks each Run: directive with `cost: cheap|long-running`).
   - Recommendation: Plan 07-02 implementation should pick command-name pattern (per CONTEXT.md suggestion) for v0.10.0; revisit with timeout-based heuristic if 0.10.0 cycle empirical data shows new long-running commands not in the override list.

4. **`<verify_request>` schema final shape.**
   - What we know: CONTEXT.md suggests `question`, `class`, `anchor_target`, optional `severity` fields. [CITED: infoq.com/articles/building-ai-agent-gateway-mcp] supports the structured-output-as-security-control pattern.
   - What's unclear: whether to use self-closing XML (`<verify_request ... />`) or open-close (`<verify_request>...</verify_request>`); whether to add a `rationale` field for the reviewer's reasoning; whether to require `severity`.
   - Recommendation: Plan 07-05 implementation should pick self-closing XML for parsing simplicity; add `rationale` field as optional; require `severity` to enable the executor to prioritize multiple `<verify_request>` blocks if the reviewer emits more than one.

5. **Plan 07-01 vs 07-03 boundary on hedge propagation rule.**
   - What we know: Plan 07-01 is "pv-* synthesis discipline" (Common Contract Rule 5 strengthening). Plan 07-03 is "confidence-laundering guards" (Common Contract Rule 5 strengthening). Both touch the same Common Contract section.
   - What's unclear: Whether the hedge propagation rule (Plan 07-03 guard 1) lives within the Plan 07-01 pv-validation rule's `<evidence>` requirements OR as a separate Common Contract bullet OR as a new Rule 5c.
   - Recommendation: Plan 07-03's hedge propagation rule lives as a separate sub-bullet (5c) within Common Contract Rule 5, structurally distinct from Plan 07-01's pv-validation rule (5b). Both fold under the umbrella of "external-claim verification before consulting" but have different fix surfaces (5b: synthesis discipline; 5c: cross-skill hedge survival).

6. **G1+G2 acceptance-criteria closure mechanism.**
   - What we know: Plan 06-05 trust-contract sentinels are present in all 4 SKILL.md (verified at-rest); the rerun fixtures show 0 ToolSearch + 0 web tools on plan-fixes / execute-fixes inputs on plugin 0.9.0.
   - What's unclear: Whether re-running plan-fixes + execute-fixes UAT subset on plugin 0.10.0 will produce non-zero ToolSearch / web-tool / pv-* signals OR whether the structural pv-validation rejection (Plan 07-01 smoke fixture) is the empirical closure for G2.
   - Recommendation: Plan 07-06 UAT replay should treat EITHER (a) ToolSearch invocation on plan-file Class-2/3/4 input OR (b) pv-* synthesis with session-grounded `<evidence>` cited on plan-file input as a passing G2 closure signal. Both signals indicate the executor is verifying empirically rather than self-anchoring; the Plan 07-01 fix can succeed via either pathway.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bash | All smoke fixtures (D-*-budget.sh, E-verify-before-commit.sh, B-pv-validation.sh) | YES | 5.x via Git Bash on Windows arm64 | -- |
| `rg` (ripgrep) | All smoke fixtures (JSONL grep, section-header regex, pattern matching) | YES | per Chocolatey x86_64 install | -- |
| `git grep` | Tracked-file search during planning | YES | bundled with Git for Windows | `rg -uu` for gitignored / untracked |
| `claude` CLI | All smoke fixtures (`claude -p` invocation), UAT replay | YES | Claude Code Team Plan installed | -- |
| Node.js | `extract-advisor-sd.mjs` (existing JSONL parser used by DEF-response-structure.sh); optional new pv-* extraction script if regex insufficient | YES | per FNM-managed install | -- |
| `git interpret-trailers` | Optional advanced detection of `Verified:` trailer (parser instead of `rg '^Verified:'`) | YES | bundled with Git for Windows | `rg '^Verified:'` against `git log -1 --format='%B'` |
| Git Bash (Windows arm64) | All Phase 7 scripts and fixtures | YES | bundled with Git for Windows | PowerShell Core (less portable; fixtures deliberately written in Bash) |
| `npm`, `pnpm`, `nx` | UAT replay scenario fixtures (npm install, npm ls, nx test, nx storybook); NOT used by Phase 7 plugin code itself | YES (npm), YES (pnpm), YES (nx via target workspace) | per project workspace | scenario-specific; UAT replay against `ngx-smart-components` requires its tooling |
| WebSearch / WebFetch tool grants | UAT replay (verify executor has tools loaded); NOT a Phase 7 build-time dependency | YES | per allowed-tools profile A in 4 SKILL.md | -- |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None.

All Phase 7 changes are markdown / YAML / Bash + `rg` based; toolchain matches Phase 6 / 5.6 / 5.5 / 5.4 conventions.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Bash + `rg` smoke fixtures + `claude -p` UAT replay (no JS test framework -- plugin is Markdown / YAML only) |
| Config file | none -- each smoke fixture is self-contained Bash script under `.planning/phases/05.4-.../smoke-tests/` |
| Quick run command | `bash .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/<fixture>.sh` (single fixture per invocation) |
| Full suite command | `for f in .planning/phases/05.4-.../smoke-tests/*.sh; do bash "$f" || true; done` (runs all fixtures sequentially); planner may add a `run-all-smokes.sh` orchestrator |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FIND-A | Silent apply-then-revert reconciliation surfaces in `<verify_before_commit>` block; reconciliation call when reverting Critical | UAT replay | UAT replay execute-fixes scenario with override + applied-then-reverted setup | partial -- existing `uat-pattern-d-replay/` infra; Plan 07-06 adapts |
| FIND-B.1 | pv-* synthesis fires for orient-phase empirical findings (>=1 pv-* per material Read or WebFetch) | smoke + UAT | `bash B-pv-validation.sh` + UAT replay | NO -- B-pv-validation.sh NEW (Plan 07-01 + 07-06) |
| FIND-B.2 | pv-* uses canonical XML format (no plain-bullet "Pre-verified Claims" sections) | smoke + UAT | `bash B-pv-validation.sh` (Assertion 1) | NO -- new |
| FIND-C | 4 confidence-laundering guards present in Common Contract; cross-skill hedge tracking in orient-exploration.md; version-qualifier rule fires; scope-disambiguated provenance markers in output templates | smoke + UAT replay | `git grep -l "Hedge propagation" plugins/lz-advisor/` + UAT replay multi-hop chain fixture | partial -- structural assertion via `git grep`; UAT replay via Plan 07-06 |
| FIND-D | Each agent's word-budget contract holds: advisor SD <=100w; reviewer Findings <=80w each, CCP <=160w, Missed-surfaces <=30w, total <=300w; security-reviewer same shape | smoke (3 fixtures) | `bash D-advisor-budget.sh && bash D-reviewer-budget.sh && bash D-security-reviewer-budget.sh` | NO -- 3 NEW fixtures (Plan 07-04) |
| FIND-E.1 | Advisor refuse-or-flag rule fires; literal "Unresolved hedge: X. Verify Y..." frame in advisor SD on hedge-marker source material | smoke + UAT | `bash E-verify-before-commit.sh` (Assertion a) | NO -- new |
| FIND-E.2 | Plan-step-shape rule executes Run: directives as Bash before commit; cost-cliff allowance for long-running async (wip: + Outstanding Verification) | smoke + UAT | `bash E-verify-before-commit.sh` (Assertion b + c) | NO -- new |
| FIND-F | Reviewer escalation hook emits structured `<verify_request>` block; executor parses + re-invokes one-shot | smoke + UAT | UAT replay review-skill scenario with Class-2 question; `rg '<verify_request question="' OUT_F` | partial -- DEF-response-structure.sh F slot; Plan 07-05 extends |
| FIND-G | Review-skill scan criterion flags hedged claims without `Verified:` trailer or pv-* anchor | smoke + UAT | UAT replay review-skill scenario with hedged input + missing trailer fixture | partial -- new criterion in lz-advisor.review/SKILL.md; UAT validates |
| FIND-H | pv-* `<evidence>` cites session-grounded source; no self-anchor evidence (`method="prior knowledge"`, etc.) | smoke + UAT | `bash B-pv-validation.sh` (Assertion 3) | NO -- new |
| FIND-silent-resolve | Plan-skill output addresses ALL numbered input findings (explicit disposition for each) | smoke + UAT | UAT replay plan-fixes scenario with N-finding input; assert `## Findings Disposition` section enumerates N items | partial -- new convention in lz-advisor.plan/SKILL.md output template; UAT validates |
| GAP-G1+G2-empirical | Plan-fixes + execute-fixes UAT replay on plugin 0.10.0 produces EITHER non-zero ToolSearch invocation OR pv-* synthesis with session-grounded `<evidence>` on plan-file Class-2/3/4 input | UAT replay | UAT replay subset (per Phase 6 amendment 5 precedent); custom assertion in `tally.mjs` | partial -- existing `uat-pattern-d-replay/` infra; Plan 07-06 adapts |

### Sampling Rate

- **Per task commit:** Smoke fixture for the rule landing in that task (e.g., Plan 07-04 commits run `D-{advisor,reviewer,security-reviewer}-budget.sh`; Plan 07-02 commits run `E-verify-before-commit.sh`; Plan 07-01 commits run `B-pv-validation.sh`)
- **Per wave merge:** Full smoke suite (`for f in *.sh; do bash "$f"; done`) plus 1 UAT replay session on representative fixture
- **Phase gate:** Full smoke suite green AND full UAT replay subset green (minimum: plan-fixes + execute-fixes + security-review on plugin 0.10.0) BEFORE `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-advisor-budget.sh` -- covers FIND-D (advisor side)
- [ ] `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-reviewer-budget.sh` -- covers FIND-D (reviewer side)
- [ ] `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh` -- covers FIND-D (security-reviewer side)
- [ ] `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh` -- covers FIND-E.1 + FIND-E.2 (3 paths: hedge-flag, verify-trailer, wip-commit)
- [ ] `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/B-pv-validation.sh` (NEW) OR extension of `KCB-economics.sh` (planner picks) -- covers FIND-B.1 + FIND-B.2 + FIND-H
- [ ] `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/runners/` -- copy `run-all.sh`, `run-session.sh`, `tally.mjs` from Phase 6 `uat-pattern-d-replay/runners/`; extend `tally.mjs` with `verified_trailer_count` + `wip_commit_count` columns
- [ ] `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/prompts/` -- session-{1..N}-<skill>.txt (planner picks scope; minimum: plan-fixes + execute-fixes + security-review)
- Framework install: none -- existing toolchain (Bash + `rg` + `claude` CLI + Node.js + Git Bash) already in place

### Smoke fixture coverage matrix (existing + NEW)

| Fixture | Findings covered | Existing in 0.9.0 | Phase 7 changes |
|---------|------------------|-------------------|-----------------|
| `KCB-economics.sh` | K (web-tool usage) + C (Pre-Verified header presence) + B (pv-* block presence) | YES | unchanged (or extend with B+H structural assertions per planner) |
| `DEF-response-structure.sh` | D (advisor Critical), E (Assuming frame), F (reviewer Findings + CCP), G+H (security-reviewer Findings + Threat Patterns), I (under-supply protection), Word-budget (advisor SD <=100w) | YES | optionally extend with sub-cap assertions per Plan 07-04 |
| `HIA-discipline.sh` | H (no permission prompts), A (reworded D-14), I (executor continues past denial) | YES | unchanged |
| `J-narrative-isolation.sh` | J (review skill scopes from git, not narrative) | YES | unchanged |
| `D-advisor-budget.sh` | D (advisor 100w cap on representative input) | NO | NEW (Plan 07-04) |
| `D-reviewer-budget.sh` | D (reviewer per-section sub-caps + 300w aggregate) | NO | NEW (Plan 07-04) |
| `D-security-reviewer-budget.sh` | D (security-reviewer per-section sub-caps + 300w aggregate) | NO | NEW (Plan 07-04) |
| `E-verify-before-commit.sh` | E.1 + E.2 + cost-cliff allowance + Verified: trailer detection | NO | NEW (Plan 07-02 + 07-06) |
| `B-pv-validation.sh` (or KCB extension) | B.1 + B.2 + H | partial (KCB has B.1) | NEW or extension (Plan 07-01 + 07-06) |

### Tier coverage matrix (per finding -> which tier validates -> per-tier acceptance criteria)

| Finding | Tier 1 (smoke) | Tier 2 (UAT replay) | Tier 3 (manual closure) |
|---------|----------------|---------------------|--------------------------|
| A | -- (no smoke fixture; behavioral) | execute-fixes scenario; n>=3 trials needed | -- |
| B.1 | B-pv-validation.sh Assertion 2 (synthesis count >=1) | plan + execute UAT (>=1 pv-* synthesized per material Read/WebFetch) | -- |
| B.2 | B-pv-validation.sh Assertion 1 (XML format) | plan-fixes UAT (no plain-bullet "Pre-verified Claims") | -- |
| C | KCB-economics + B-pv-validation + structural git grep for Common Contract sentinels | multi-hop chain UAT (review -> plan-fixes -> execute-fixes -> security-review) | -- |
| D | D-{advisor,reviewer,security-reviewer}-budget.sh (3 fixtures) | UAT replay observed word counts <=cap | -- |
| E.1 | E-verify-before-commit.sh Assertion (a) | execute-fixes UAT with hedge-marker source material | -- |
| E.2 | E-verify-before-commit.sh Assertions (b) + (c) | execute-fixes UAT with explicit Run/Verify directives | -- |
| F | DEF F slot + UAT-side `rg '<verify_request question="'` | review-skill UAT with Class-2 question | -- |
| G | -- (behavioral; no atomic smoke) | review-skill UAT on commits with hedged claims missing Verified: trailer | -- |
| H | B-pv-validation.sh Assertion 3 (no self-anchor) + Assertion 4 (no empty evidence) | plan-fixes + execute-fixes UAT | -- |
| silent-resolve | -- (behavioral) | plan-fixes UAT with N-finding input; assert disposition for all N | -- |
| GAP-G1+G2-empirical | -- (regression-only; smoke is structural at-rest) | plan-fixes + execute-fixes UAT subset on plugin 0.10.0 | 06-VERIFICATION.md amendment 6 (Plan 07-06): downgrade PASS-with-caveat -> PASS once Plan 07-01 verification passes |

### Tier 1 (smoke fixtures) acceptance criteria

All fixtures exit code 0 on plugin 0.10.0:
- KCB-economics.sh: K + C + B all `[OK]`
- DEF-response-structure.sh: D + E + F + G+H + I + Word-budget all `[OK]`
- HIA-discipline.sh: H + A + I all `[OK]`
- J-narrative-isolation.sh: J `[OK]`
- D-advisor-budget.sh: advisor SD <=100w on representative Compodoc+Storybook scenario `[OK]`
- D-reviewer-budget.sh: each Findings <=80w, CCP <=160w, Missed-surfaces <=30w, total <=300w `[OK]`
- D-security-reviewer-budget.sh: each Findings <=80w, Threat Patterns <=160w, Missed-surfaces <=30w, total <=300w `[OK]`
- E-verify-before-commit.sh: at least one of (a) hedge-flag path OR (b) verify-trailer path OR (c) wip-commit path satisfied `[OK]`
- B-pv-validation.sh: Assertions 1-4 all `[OK]` (XML format + synthesis >=1 + no self-anchor + no empty evidence)

### Tier 2 (UAT replay) acceptance criteria

UAT replay subset on plugin 0.10.0 (per Phase 6 amendment 5 precedent: minimum plan-fixes + execute-fixes + security-review):
- Multi-hop chain (review -> plan-fixes -> execute-fixes -> security-review) on representative Compodoc+Storybook scenario produces:
  - At least one of (i) ToolSearch invocation on plan-file Class-2/3/4 input OR (ii) pv-* synthesis with session-grounded `<evidence>` on plan-file input -- closes GAP-G1+G2-empirical
  - Hedge markers from upstream skills survive into downstream consultation prompts (Plan 06-05 hedge-marker preservation regression coverage)
  - Plan-fixes output addresses all N input findings with explicit disposition (silent-resolve sub-pattern closure)
  - Execute-fixes either (a) advisor flags unresolved hedge OR (b) executor performs verification + Verified: trailer OR (c) wip:-commit + Outstanding Verification (E.1/E.2 closure)
  - Reviewer emits `<verify_request>` for unresolved Class-2 question; executor re-invokes one-shot (F closure via Option 2)
- Word-budget observed values: advisor <=100w, reviewer / security-reviewer <=300w aggregate per their sub-cap structure (D closure)

### Tier 3 (manual closure) acceptance criteria

- 06-VERIFICATION.md amendment 6 written by Plan 07-06: downgrade PASS-with-caveat to PASS once Plan 07-01 verification passes (closes GAP-G1+G2-empirical at the milestone-audit layer)
- 07-VERIFICATION.md produced by gsd-verifier: Phase 7 gate verdict captured; any human_needed items surfaced
- ROADMAP.md / STATE.md updated to reflect Phase 6 closure + Phase 7 closure

## Security Domain

**Note:** `security_enforcement` is not explicitly set in `.planning/config.json`; per the gsd-phase-researcher contract, this section is INCLUDED. However, this phase does not introduce user-facing functionality, network exposure, authentication, or data persistence -- it modifies AI-agent prompt-construction prose and adds smoke fixtures. The most relevant security concern is **subagent privilege escalation**, which is addressed by Plan 07-05's principle-of-least-privilege design.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | NO | Plugin has no auth surface |
| V3 Session Management | NO | Plugin has no session surface |
| V4 Access Control | YES | Reviewer / security-reviewer agent tool grant `[Read, Glob]` is the access-control boundary; Plan 07-05 Option 3 (extend grant) explicitly rejected per OWASP / arXiv 2601.11893 / Claude Code Issue #20264 |
| V5 Input Validation | YES | Common Contract Rule 5a wraps fetched web content in `<fetched source="<URL>" trust="untrusted">...</fetched>` tags + escapes nested `<fetched>` patterns; agents flag (not comply with) imperatives in fetched content |
| V6 Cryptography | NO | No crypto surface |
| V7 Error Handling and Logging | NO | No structured error / log surface |
| V8 Data Protection | NO | No data persistence |
| V9 Communication | NO | No network surface in plugin code itself |
| V10 Malicious Code | YES | Common Contract Rule 5a defends against prompt-injection via fetched content; Plan 07-05 `<verify_request>` structured output is the security control [CITED: OWASP AI Agent Security Cheat Sheet] |
| V11 Business Logic | NO | -- |
| V12 Files and Resources | NO | Plugin has no file-upload surface |
| V13 API and Web Service | NO | -- |
| V14 Configuration | YES | Plugin's `allowed-tools` configuration in 4 SKILL.md is the security boundary (Profile A: full grant for executor; Profile B/C reduced for reviewers); Phase 7 preserves all existing profiles |

### Known Threat Patterns for plugin runtime

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Subagent privilege escalation via tool-grant inheritance | Elevation of Privilege | Reviewer / security-reviewer keep `[Read, Glob]`; Plan 07-05 Option 3 permanently deferred per [CITED: github.com/anthropics/claude-code/issues/20264] |
| Prompt injection via fetched content (`<fetched>...</fetched>` block contains imperatives or role-reassignment) | Tampering | Common Contract Rule 5a: agents flag imperatives in fetched content as anomaly; replace `<` with `&lt;` in any nested `<fetched>` patterns before wrapping |
| Confidence laundering via cross-skill hedge stripping | Tampering | Plan 07-03 hedge propagation rule + cross-skill hedge tracking + version-qualifier anchoring + scope-disambiguated provenance markers |
| Self-anchor confabulation in pv-* synthesis | Repudiation | Plan 07-01 pv-validation rule: `<evidence>` MUST cite session-grounded source; smoke fixture rejects self-anchor evidence |
| Verify-skip on agent-generated source classified as authoritative | Tampering | Phase 6 Plan 06-05 trust-contract carve-out + Plan 07-01 ToolSearch-availability supplement |
| Imprimatur attached to commits with unverified API claims (cross-axis confidence laundering) | Repudiation | Plan 07-03 scope-disambiguated provenance markers (`scope: api-correctness`, `scope: security-threats`); downstream skills check scope-match |

## Sources

### Primary (HIGH confidence)

- [VERIFIED: file read 2026-05-01] -- `plugins/lz-advisor/agents/{advisor,reviewer,security-reviewer}.md`, `plugins/lz-advisor/skills/lz-advisor.{plan,execute,review,security-review}/SKILL.md`, `plugins/lz-advisor/references/{context-packaging,orient-exploration}.md`, `plugins/lz-advisor/.claude-plugin/plugin.json`
- [VERIFIED: file read 2026-05-01] -- `.planning/phases/06-address-phase-5-6-uat-findings/PHASE-7-CANDIDATES.md` (8 candidate findings + 8-UAT chain summary), `06-VERIFICATION.md` (5 amendments + GAP-G1+G2-empirical), `06-CONTEXT.md` (D-01..D-06 inherited canon)
- [VERIFIED: file read 2026-05-01] -- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-CONTEXT.md` (D-01..D-07 locked decisions; Claude's Discretion list; deferred-ideas list)
- [VERIFIED: file read 2026-05-01] -- `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/{KCB-economics.sh,DEF-response-structure.sh}` (canonical smoke-fixture pattern)

### Secondary (MEDIUM confidence -- WebSearch verified with named source)

- [CITED: prompthub.us/blog/an-analysis-of-the-claude-4-system-prompt] -- Anthropic's leaked Claude 4 system prompt analysis: descriptive prose for non-safety rules, ALL-CAPS reserved for safety-critical (anchors D-03 phrasing style)
- [CITED: buildthisnow.com/blog/models/claude-code-quality-regression-2026] -- Anthropic's April 2026 ablation: 3% coding-quality drop from single verbosity-cap addition (anchors D-03 hard-rules layer rejection)
- [CITED: blockchain-council.org/claude-ai/claude-output-control] -- Layered output control: hard cap + soft system prompt + structured outputs (anchors D-03 hybrid pattern + D-05 cost-cliff allowance)
- [CITED: claudefa.st/blog/tools/hooks/self-validating-agents] -- Three-layer self-validating agent architecture: micro/macro/team (anchors D-03 + D-05 mapping to lz-advisor: Output Constraint + smoke fixtures + UAT replay)
- [CITED: cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html] -- Principle of least privilege + structured-output as security control (anchors D-04 Option 3 rejection + Option 2 design)
- [CITED: arxiv.org/html/2601.11893v1] -- Formal treatment of agent privilege escalation (anchors D-04 Option 3 rejection)
- [CITED: github.com/anthropics/claude-code/issues/20264] -- Subagent privilege inheritance escalation concern (anchors D-04 Option 3 rejection)
- [CITED: infoq.com/articles/building-ai-agent-gateway-mcp] -- Least-privilege AI Agent Gateway: structured-output validation, MCP discovery, JSON-RPC structured calls (anchors D-04 Option 2 `<verify_request>` design)
- [CITED: dev.to/moonrunnerkc/ai-coding-agents-lie-about-their-work-outcome-based-verification-catches-it-12b4] -- Outcome-based verification 5-check model + Spotify Honk one-shot pass/fail (anchors D-04 + D-05 + Phase 7 Verified: trailer architecture)
- [CITED: cursor.com/blog/agent-best-practices] -- TDD anchor pattern (anchors D-05 Element 1 advisor refuse-or-flag rule)
- [CITED: augmentcode.com/blog/best-practices-for-using-ai-coding-agents] -- Verification bottleneck (only 48% of devs verify AI code); paired upstream-prevention + downstream-detection (anchors Plan 07-02 paired E + G design)
- [CITED: qwenlm.github.io/qwen-code-docs/en/users/features/code-review] -- Pre-flight deterministic scan as production default; linters and type-checkers run before LLM (anchors D-04 Option 1)
- [CITED: whyaitech.com/notes/systems-note-002] -- Citation-based RAG: "illusion of groundedness" + "hallucinated bridges" (anchors Plan 07-01 pv-validation operating on `<evidence>` content, not block presence)
- [CITED: trulens.org/getting_started/core_concepts/rag_triad] -- RAG Triad: context relevance, groundedness, answer relevance; atomic-claim verification (anchors Plan 07-01 source-grounded `<evidence>` requirement)
- [CITED: arxiv.org/html/2509.08182v1] -- Grammar-constrained decoding for XML structured prompts; convergence guarantees on protocol-adherent outputs (anchors Plan 07-01 smoke-fixture-as-grammar-substitute since grammar-constrained decoding is unavailable in Claude Code)
- [CITED: platform.claude.com/docs/en/build-with-claude/prompt-engineering/use-xml-tags] -- Anthropic XML structuring guidance (anchors pv-* XML format mandate per Plan 07-01)
- [CITED: git-scm.com/docs/git-interpret-trailers] -- Trailer format: capitalized key, `:` separator, value follows; `git interpret-trailers --parse` available (anchors Verified: trailer detection per Plan 07-02 Element 4)
- [CITED: github.com/conventional-commits/conventionalcommits.org/issues/38, /issues/137] -- `wip:` prefix is community-adopted extension, not part of official Conventional Commits spec (anchors Plan 07-02 Element 3 wip: convention as Claude's Discretion)

### Tertiary (LOW confidence -- WebSearch only, marked for validation)

- WebSearch results for "conventional commits wip: prefix specification 2026" -- multiple non-authoritative sources (FlowingCode, dmitriydubson.com, graphapp.ai); confirms `wip:` is community-adopted, not officially specified. **Validation needed:** Plan 07-02 implementation should pick a wip: convention aligned with the project's existing commit style if any precedent exists; otherwise pick the simplest form (`wip: <description>`) per CONTEXT.md Claude's Discretion.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all 9 files [VERIFIED: file read 2026-05-01]; existing structure + additive content design preserves byte-identical canon
- Architecture: HIGH -- 3 patterns (additive content within byte-identical canon; outcome-based verification cross-grep; source-provenance + question-class branching) all anchored in existing Phase 5.6 / 6 conventions
- Pitfalls: HIGH -- 6 pitfalls all anchored in 13-UAT empirical evidence base; each has a session-log citation in PHASE-7-CANDIDATES.md
- Smoke fixture design: MEDIUM-HIGH -- patterns derive from KCB-economics.sh + DEF-response-structure.sh; A2 (JSONL trace shape for pv-* extraction) is the load-bearing assumption needing validation against an existing successful pv-* trace before locking the regex
- Validation Architecture: HIGH -- 3-tier coverage matrix (smoke + UAT replay + manual closure) follows Phase 6 amendment 5 precedent; all 11 findings + 1 gap mapped to validation tiers; Wave 0 gaps explicit
- Security domain: MEDIUM -- ASVS V4/V5/V10/V14 apply; no new attack surface introduced in Phase 7 (additive content within existing structure); subagent-privilege-escalation defense (Plan 07-05 Option 3 rejection) is the load-bearing security control

**Research date:** 2026-05-01

**Valid until:** 2026-05-31 (30 days for stable plugin-prompt-engineering domain). Re-validate if: (a) Anthropic releases Opus 4.8 or Sonnet 4.7 (model behavior may shift, requiring re-calibration of word-budget sub-caps and advisor refuse-or-flag frame); (b) Claude Code adds plugin-level grammar constraints or hooks (would simplify Plan 07-01 pv-* validation from smoke-fixture to runtime); (c) Conventional Commits spec adds official `wip:` type (would lock the wip: convention from Claude's Discretion to project convention); (d) ngx-smart-components testbed dependency versions change (would require re-running UAT replay to validate version-qualifier anchoring rule on a new vendor library).

---

*Phase: 07-address-all-phase-5-x-and-6-uat-findings*
*Research date: 2026-05-01*
