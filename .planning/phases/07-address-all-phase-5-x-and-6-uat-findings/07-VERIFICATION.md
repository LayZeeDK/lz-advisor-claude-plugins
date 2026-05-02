---
status: gaps_found
phase: 07-address-all-phase-5-x-and-6-uat-findings
type: verification
plugin_version: 0.10.0
gate_verdict: GAPS_FOUND_within_phase
score: "structural plans landed (6/6); empirical residuals on 2 of 5 plans require gap-closure"
verification_basis: 8-session UAT replay on plugin 0.10.0 against ngx-smart-components testbed (Compodoc + Storybook 10 + Angular signals scenario)
session_notes: .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/uat-replay/session-notes.md
amendment_6: .planning/phases/06-address-phase-5-6-uat-findings/06-VERIFICATION.md (sixth amendment, dated 2026-05-01)
started: 2026-04-30
ended: 2026-05-01
---

# Phase 7 Verification -- 8-Session UAT Replay on Plugin 0.10.0

## Goal-backward verification

**Phase 7 goal:** Address all Phase 5.x and 6 UAT findings (Findings A, B.1+B.2, C, D, E, F, H + GAP-G1+G2-empirical from Phase 6 amendment 5).

**Empirical verification basis:** 8-session UAT replay chain against ngx-smart-components testbed on plugin 0.10.0:

| # | Skill | Session ID |
|---|-------|-----------|
| 1 | lz-advisor.plan | `f2d669f3-...` |
| 2 | lz-advisor.execute | `6276171a-...` |
| 3 | lz-advisor.review | `a1503efa-...` |
| 4 | lz-advisor.plan (plan-fixes) | `0d55118f-...` |
| 5 | lz-advisor.execute (execute-fixes) | `29db446f-...` |
| 6 | lz-advisor.security-review | `2b5f3ae5-...` |
| 7 | lz-advisor.plan (plan-fixes-2) | `bfa913fa-...` |
| 8 | lz-advisor.execute (execute-fixes-2) | `b614d3dd-...` |

Per-session evidence in `uat-replay/session-notes.md`. Smoke gate: 6 PASS, 3 FAIL (5 NEW Phase 7 fixtures all PASS; 3 pre-existing failures classified). Full closure narrative in `06-VERIFICATION.md` amendment 6.

## Verification verdict by plan

| Plan | Goal | Status | Evidence |
|------|------|--------|----------|
| 07-01 (pv-* validation + ToolSearch supplement) | GAP-G1+G2-empirical CLOSED at synthesis layer | **PASSED structurally + partial empirical** | B-pv-validation.sh PASS on 0.10.0 (4/4 assertions). 9 source-grounded pv-* blocks across sessions 1, 3, 6. ToolSearch precondition fired in 2 of 8 sessions (sessions 1 + 3) — first empirical confirmations across 8+ UAT cycles since Phase 5. **GAP: rule did not fire in 6 of 8 sessions** (see Within-Phase Gaps below) |
| 07-02 (verify-before-commit + hedge marker + silent-resolve + Finding A) | Plan-step shape rule (E.2) + hedge discipline (E.1) + silent-resolve sub-pattern + reconciliation extension | **PASSED on most surfaces, ambiguity on wip-discipline** | Hedge marker discipline empirically firing in 6 of 8 sessions. Silent-resolve sub-pattern CLOSED in BOTH plan-fixes UATs (sessions 4 + 7). Verify-before-commit progressively correct (sessions 2 → 5 → 8). Session 8 first conformant Verified: trailer in single-commit. **GAP: wip-discipline scope ambiguity** (see Within-Phase Gaps below) |
| 07-03 (4 confidence-laundering guards + scope-disambiguated provenance markers) | Finding C closure | **PASSED** | Verdict scope markers across all 8 sessions (5 api-correctness + 3 security-threats). Cross-axis verdict scope inheritance robust across plan + execute (sessions 7 + 8) |
| 07-04 (word-budget structural sub-caps + 3 D-*-budget smoke fixtures) | Finding D closure | **PASSED structurally** | All 3 D-*-budget smoke fixtures PASS on 0.10.0. Per-section sub-caps mostly enforced; aggregate cap exceeded on code-dense outputs across 4 of 8 sessions. Improvement trajectory (135w → 95w final advisor in session 8) |
| 07-05 (reviewer Class-2 escalation hook Option 1 + Option 2) | Finding F closure | **PASSED** | Pre-emptive Class-2/2-S scan fired in sessions 3 + 6. Reviewer accepted pv-* anchors in both. Zero `<verify_request>` escalations needed (Option 1 + Option 2 working in tandem) |
| 07-06 (plugin 0.10.0 + E-verify smoke + UAT replay + Amendment 6) | Verification stage | **PASSED** | All 5 tasks complete: plugin bumped 0.9.0 → 0.10.0 (5 surfaces), E-verify smoke fixture PASS, UAT replay infrastructure copied + extended, 8-session UAT chain executed, 06-VERIFICATION.md amendment 6 appended |

## Within-Phase Gaps (gap-closure plans needed BEFORE phase complete)

These two residuals are real Plan 07-01 / Plan 07-02 design defects empirically surfaced by the 8-session UAT chain. Both are within-Phase-7 scope (refining plans landed in Phase 7) and benefit from gap-closure plans before Phase 7 is sealed.

### Gap 1: Plan 07-01 ToolSearch precondition rule does not reliably fire

**Severity:** MAJOR (recurring across 6 of 8 UAT sessions)

**Surface:** `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md`, `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md`, `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md`, `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md` (byte-identical `<context_trust_contract>` block, ToolSearch availability rule)

**Evidence:** Sessions 2 (execute), 4 (plan-fixes), 5 (execute-fixes), 6 (security-review), 7 (plan-fixes-2), 8 (execute-fixes-2) all skipped ToolSearch despite agent-generated source material on Class 2/3/4 questions. Sessions 1 (plan) + 3 (review) fired correctly. The strict-text reading of the rule ("ToolSearch precondition fires regardless of whether the orient ranking has classified the question yet") isn't holding empirically.

**Possible fix surfaces** (for gap-closure plan to research):
- Rephrase the rule with more concrete trigger language and a worked example
- Convert from precondition (text-steered) to default-on Phase 1 action whenever any agent-generated source material is detected
- Add hook-based enforcement (PreToolUse on Agent invocation) that auto-invokes ToolSearch when agent-generated source is detected
- Add a non-text steering mechanism (advisor refusal-pattern, hard skill-prefix, or reference-doc cue)

**Reference:** session-notes.md Phase 7 GAPS sections (sessions 2, 4, 5, 6, 7, 8) + `06-VERIFICATION.md` amendment 6 residual #1.

### Gap 2: Plan 07-02 wip-discipline scope ambiguity

**Severity:** MAJOR (2 empirical instances: sessions 2 + 5; session 8 got it right)

**Surface:** `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md` `<verify_before_commit>` Phase 3.5 section, specifically the "Cost-cliff allowance for long-running async validations" subsection

**Evidence:** Session 2 commit `8c25c9e` and session 5 commit `06af4cf` both shipped non-wip commits with populated `## Outstanding Verification` sections. Per Plan 07-02 cost-cliff allowance: *"Long-running async validations move to a `wip:` prefixed commit + `## Outstanding Verification` section in the commit body listing the pending checks."* The executor's interpretation: "this commit's own claims are verified, so non-wip is fine even if some other concern is pending". Strict text reading: when `## Outstanding Verification` is present, subject MUST be `wip:`-prefixed.

**Possible fix surfaces** (for gap-closure plan to research):
- Tighten Plan 07-02 SKILL.md text per P8-13 hypothesis: *"When a commit body contains `## Outstanding Verification` section listing pending Run: directives, the commit subject MUST use `wip:` prefix UNLESS the commit ONLY records additional `Verified: <claim>` trailers for already-listed Outstanding items."*
- Update `E-verify-before-commit.sh` smoke fixture path-c to require the wip + Outstanding Verification conjunction (catches the gap empirically)
- Add a worked example to the SKILL.md showing both correct (wip: with Outstanding Verification) and incorrect (non-wip with Outstanding Verification) shapes

**Reference:** session-notes.md Session 2 + Session 5 GAPS rows + P8-13 candidate + `06-VERIFICATION.md` amendment 6 residual #2.

## Out-of-Phase Residuals (defer to Phase 8 or accept as PASS-with-residual)

These three MAJOR residuals + 22 Phase 8 candidates are NOT in-phase Plan 07-01..07-05 design defects. They are either:

- Capability extensions beyond Phase 7's documented scope (e.g., P8-03 Pre-Verified Contradiction Rule would be a 5th confidence-laundering guard; Plan 07-03 had 4)
- New patterns/heuristics surfaced by the empirical chain (e.g., P8-12 plan-fixes auto-detection from review file path)
- Cross-skill workflow concerns (P8-19 + P8-21 cross-axis scope inheritance)
- Positive observations validating existing design (P8-11, P8-14, P8-16)

| # | Residual | Phase 8 candidate ID | Why deferred |
|---|----------|----------------------|--------------|
| 3 | Cross-Skill Hedge Tracking gap (session 5 input mismatch) | P8-12 | Trust-contract heuristic addition (auto-detect plan-fixes plan from review file path); not a defect of any landed Plan 07-01..07-05, more of a NEW capability |
| 4 | Reconciliation rule NOT invoked when advisor reframes a packaged claim (sessions 2 + 7) | P8-03 (strongest Phase 8 candidate) | Pre-Verified Contradiction Rule would be a 5th confidence-laundering guard. Plan 07-03 had 4; this is a new guard, not a refinement |
| 5 | Self-anchor pattern (Finding H) leaks through advisor narrative SD prose | P8-18 | Plan 07-01 Rule 5b applies to `<pre_verified>` XML blocks; advisor narrative claims aren't pv-* shaped. Mixed: could refine Rule 5b OR add new rule. Defer until empirical investigation of advisor narrative-SD self-anchor frequency |

Plus 4 MINOR residuals (word-budget aggregate, Verified: format inconsistency in early commits, Class 2-S step-1-sufficient short-circuit, Phase 2 pre-execute consult skip in session 8) and 19 Phase 8 candidates spanning capability extensions, positive observations, and design-tradeoff documentation tasks.

Full Phase 8 candidate list: `uat-replay/session-notes.md` Phase 7 Closure Verdict section.

## Recommended next action

Run `/gsd-plan-phase 7 --gaps` to create gap-closure plans for the two within-Phase-7 gaps (07-07 ToolSearch rule strengthening, 07-08 wip-discipline language tightening). After gap closure, mark Phase 7 complete (PASS-with-residual; residuals 3, 4, 5 + 22 candidates handed off to hypothetical Phase 8).

## Amendment 2026-05-01 -- Gap 1 CLOSED via Plan 07-07 (default-on ToolSearch + worked examples)

**Trigger:** Plan 07-07 landed (Tasks 1-5 complete; structural verification by frontmatter validation + B-pv-validation.sh syntax check + cross-file diff).

**Status change:** Gap 1 MAJOR (recurring across 6 of 8 UAT sessions) -> Gap 1 CLOSED structurally.

### Closure mechanism

Per `07-RESEARCH-GAP-1-toolsearch.md` Recommendation section, Gap 1 closes via two paired refinements landed in Plan 07-07:

1. **Candidate B (default-on conversion)** -- the ToolSearch availability rule in the 4-skill byte-identical `<context_trust_contract>` block was reframed from precondition-with-AND-conjunction ("WHEN agent-generated source AND Class 2/3/4 THEN invoke ToolSearch BEFORE ranking") to default-on Phase 1 first action ("WHEN agent-generated source THEN invoke ToolSearch as Phase 1 first action, regardless of question class"). The cost-asymmetry framing ("one redundant ToolSearch is much cheaper than confabulated pv-* synthesis") provides the user-visible WHY that Anthropic's prompting best practices identify as load-bearing for tool-use steering on Sonnet 4.6 / Opus 4.7.

2. **Candidate A (worked examples)** -- two `<example>` blocks added immediately after the reframed rule: a positive example (agent-generated review file with Class-2 question fires ToolSearch) and a boundary example (vendor-doc authoritative source does NOT fire ToolSearch). The worked examples close the gap that Plan 07-01 left open (the rule had no `<example>` block; Anthropic's documented best practice is 3-5 examples wrapped in `<example>` tags).

### Structural verification (this amendment)

- 4 SKILL.md `<context_trust_contract>` blocks contain the reframed `ToolSearch availability rule (default-on Phase 1 first action).` paragraph + 2 `<example>` blocks.
- 4 SKILL.md blocks remain byte-identical to each other (3 cross-file diffs against plan SKILL.md baseline exit 0).
- `references/context-packaging.md` Rule 5b ToolSearch precondition sub-rule reframed to align with the default-on framing.
- `B-pv-validation.sh` extended with Assertion 5 + a second scratch-repo scenario exercising the agent-generated-input path; bash -n syntax check passes.
- Plugin version bumped 0.10.0 -> 0.11.0 across 5 surfaces.

### Empirical verification (deferred)

The empirical closure criterion -- a fresh UAT replay subset (minimum: plan-fixes + execute-fixes + security-review per Phase 6 amendment 5 precedent) on plugin 0.11.0 confirming ToolSearch firing in 8 of 8 sessions where agent-generated source is present -- is OUT of Plan 07-07 scope. The structural surfaces are in place; behavioral confirmation lands in the next phase's UAT replay if Phase 7 is sealed before then, or in a follow-up empirical-validation cycle.

### Closure scope

- **Gap 1: CLOSED structurally** at the prompt-rule + smoke-fixture layer. Per the gap closure pair landing in tandem with Gap 2 (Plan 07-08), Phase 7 is now ready to seal as PASS-with-residual.
- The Phase 8 candidates (out-of-phase residuals 3, 4, 5 per 07-VERIFICATION.md) remain deferred to a hypothetical Phase 8.

## Amendment 2026-05-01 -- Gap 2 CLOSED via Plan 07-08 (subject-prefix discipline + 3-shape worked example + path-d detection with synthesized in-process scenario)

**Trigger:** Plan 07-08 landed (Tasks 1-5 complete; structural verification by frontmatter validation + bash -n syntax check + cross-file diff; structural smoke validation per 07-08-REPLAY-RESULTS.md showing the synthesized in-process path-d scenario fires exit 2 + the --replay flag's error-path emits clear "cannot read commit" + exit 65 against the testbed-only SHAs).

**Status change:** Gap 2 MAJOR (2 empirical instances on plugin 0.10.0; sessions 2 + 5 in the external ngx-smart-components testbed) -> Gap 2 CLOSED structurally. Empirical replay against the testbed SHAs is a documented manual-auditor operation, not a phase-closure gate (matching Plan 07-07 Gap 1 closure pattern: "structurally CLOSED, empirical deferred").

### Closure mechanism

Per `07-RESEARCH-GAP-2-wip-discipline.md` Recommendation section, Gap 2 closes structurally via three paired refinements landed in Plan 07-08:

1. **Candidate 1 (contract language tightening)** -- `lz-advisor.execute/SKILL.md` `<verify_before_commit>` Phase 3.5 cost-cliff allowance subsection extends with a NEW `### Subject-prefix discipline when Outstanding Verification is populated` subsection that states the positive rule ("when a commit body contains `## Outstanding Verification`, the commit subject MUST use the `wip:` prefix") + the trailer-only carve-out ("UNLESS the commit ONLY records additional `Verified:` trailers for already-listed Outstanding items, with ZERO file changes per `git diff --stat HEAD~1..HEAD`") + the motivation ("BRANCH-STATE preservation, not per-commit narrative"). The contract language follows Anthropic's own Claude 4 system-prompt structure (positive defaults + narrow enumerated exceptions + explicit motivation per `prompthub.us` Claude 4 system prompt analysis + `docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices`).

2. **Candidate 2 (worked example pair)** -- `lz-advisor.execute/SKILL.md` extends with a NEW `### Worked example: wip subject + Outstanding Verification` subsection containing 3 commit shapes: Shape 1 CORRECT (`wip:` subject + Outstanding Verification), Shape 2 INCORRECT (the per-commit reading: `fix:` subject + Outstanding Verification), Shape 3 CORRECT carve-out (trailer-only follow-up: zero file changes, drops `wip:` prefix). The 3-shape pattern follows `dreamhost.com/blog/claude-prompt-engineering` ("use positive and negative examples") and the existing repo precedent in `agents/advisor.md` lines 62-76 (two density examples).

3. **Candidate 3 (path-d detection layer + synthesized in-process scenario)** -- `E-verify-before-commit.sh` extends with: (a) a path-d negative assertion that catches the empirical session 2 + 5 gap shape (non-wip subject + populated `## Outstanding Verification` + non-zero file changes outside the trailer-only carve-out); (b) a SYNTHESIZED in-process scenario that creates a non-wip commit + Outstanding Verification + non-zero file changes inside the scratch repo, so path-d fires structurally within the smoke run; (c) a `--replay <sha>` flag for manual-auditor regression validation against historical commits in external testbed repos (the empirical session 2 / 5 SHAs live in ngx-smart-components, not in this plugin repo); (d) clear error message + exit 65 when --replay is invoked against a SHA not in the current working-tree repo. Three exit codes differentiated: 0 pass, 1 broken-assertion or no-positive-path, 2 path-d violation (synthesized expected firing OR executor's own commit).

### Structural verification (this amendment)

Plan 07-08 Task 3 ran the four structural-validation steps and captured results in 07-08-REPLAY-RESULTS.md:

| Step | Expected exit | Observed exit | Verdict |
|------|---------------|---------------|---------|
| 1: synthesized in-process scenario | 2 (path-d fires; Gap 2 closure structurally proven) | 2 | PASS |
| 2: --replay 8c25c9e (testbed SHA) | 65 (cannot read commit; flag error-path wired) | 65 | PASS |
| 3: --replay 06af4cf (testbed SHA) | 65 (cannot read commit; flag error-path wired) | 65 | PASS |
| 4: --replay 15d8fac (testbed SHA) | 65 (cannot read commit; flag error-path wired) | 65 | PASS |

The smoke fixture path-d assertion structurally validates the gap (subject regex + `## Outstanding Verification` body + non-zero git diff = exit 2 in the synthesized scenario). Empirical replay against the live ngx-smart-components testbed SHAs is a documented manual operation, not a phase-closure gate.

### Closure scope

- **Gap 2: CLOSED structurally** at the contract surface (Candidate 1 + Candidate 2) AND the smoke fixture surface (Candidate 3 with synthesized in-process scenario firing path-d within this plugin repo's smoke run).
- **Empirical replay** against the ngx-smart-components testbed SHAs (8c25c9e session 2, 06af4cf session 5, 15d8fac session 8 baseline) is a manual-auditor operation: cd into the testbed and run --replay there. Not required for phase closure.
- The Phase 8 candidates (out-of-phase residuals 3, 4, 5 per 07-VERIFICATION.md) remain deferred to a hypothetical Phase 8.

### Phase 7 sealing readiness

With Gap 1 CLOSED structurally (Plan 07-07 amendment) + Gap 2 CLOSED structurally (this amendment), Phase 7 is now READY TO SEAL as **PASS-with-residual** -- core Gap 1 + Gap 2 closed at the contract + smoke layers; out-of-phase residuals (3, 4, 5) and 22 Phase 8 candidates handed off to a hypothetical Phase 8 per `06-VERIFICATION.md` Amendment 6.

## Amendment 2026-05-02 -- GAP-D-budget-empirical CLOSED via Plan 07-09 (fragment-grammar emit template + effort de-escalation + smoke fixture parser update + plugin 0.12.0)

**Trigger:** Plan 07-09 landed (Tasks 1-4 complete; structural verification by frontmatter validation + bash -n syntax check on both D-{reviewer,security-reviewer}-budget.sh fixtures + cross-file diff confirming no non-ASCII bytes in modified surfaces).

**Status change:** GAP-D-budget-empirical (3 failed gaps from 07-UAT.md: reviewer 396w / 32% over, security-reviewer 414w / 38% over, security-reviewer Missed surfaces 33w / 10% over) -> GAP-D-budget-empirical CLOSED structurally.

### Closure mechanism

Per `07-RESEARCH-WORDBUDGET.md` Recommendation section, GAP-D-budget-empirical closes structurally via two paired refinements landed together in Plan 07-09:

1. **Candidate A (Fragment-Grammar Output Template)** -- the descriptive sub-cap prose in `agents/reviewer.md` and `agents/security-reviewer.md` `## Output Constraint` sections is replaced with an explicit one-line-per-finding output template (`<file>:<line>: <severity>: <problem>. <fix>.`) + ASCII severity prefixes (`crit:` / `imp:` / `sug:` / `q:` mapped to existing Severity Classification) + explicit DROP / KEEP lists + 3 worked example pairs (verbose INCORRECT vs fragment CORRECT) per Anthropic Best Practices "positive examples beat negative instructions." Anchored in caveman empirical baseline (`D:\projects\JuliusBrussee\caveman` benchmarks/run.py + evals/snapshots/results.json: 65% mean output reduction across 10 prompts x 3 trials on `claude-sonnet-4-20250514` + `claude-opus-4-6`; range 22-87%). The fragment-grammar shape BINDS output length structurally rather than describing it; the per-section caps Plan 07-04 chose were mathematically incompatible with the 300w aggregate (5x80 + 160 + 30 = 590w upper bound).

2. **Candidate B (Effort De-escalation)** -- reviewer + security-reviewer frontmatter changes from `effort: xhigh` to `effort: medium`. Anchored in Anthropic Best Practices "Calibrating effort and thinking depth" section: "Good for cost-sensitive use cases that need to reduce token usage while trading off intelligence." Per Anthropic April 23, 2026 postmortem, Opus 4.7 at xhigh produces verbose justification chains by design ("notable behavioral quirk: tends to be quite verbose"); fighting verbosity in prose is fighting the model's training. CONTEXT.md D-04 amended with 2026-05-02 amendment block + binding reversion criterion (15% Class-1 recall drop on empirical UAT replay; otherwise revert to xhigh + Candidate A alone).

### Smoke fixture parser updates (Plan 07-09 Task 3)

`D-reviewer-budget.sh` and `D-security-reviewer-budget.sh` `ENTRY_CHECK_SCRIPT` heredocs replaced with a fragment-grammar parser:

- Per-line word target: <=20 words for reviewer (problem + fix; excludes `<file>:<line>: <severity>:` prefix); <=22 for security-reviewer (slightly higher to accommodate OWASP tag `[A0N]` which adds ~2-4 words to the line length budget).
- Outlier soft cap: 25w / 28w respectively.
- Backward-compat fallback regex (`^(?:\d+\.\s+|\*\*Finding\s+\d+:?\s*\*?\*?\s*)`) handles transitional Plan 07-04 numbered-section shape with `[WARN]` signaling preferred fragment shape.
- Aggregate <=300w assertion PRESERVED BYTE-IDENTICALLY -- this is the load-bearing gate that closes the gap.
- Section-presence assertions for `### Findings` + `### Cross-Cutting Patterns` / `### Threat Patterns` + `### Missed surfaces` PRESERVED.

### Structural verification (this amendment)

| Surface | Expected | Observed | Verdict |
|---------|----------|----------|---------|
| reviewer.md fragment-grammar template present | `Format: <file>:<line>: <severity>: <problem>. <fix>.` literal text | landed | PASS |
| security-reviewer.md fragment-grammar template present (with OWASP tag) | `Format: <file>:<line>: <severity>: [<OWASP-tag>] <threat>. <fix>.` literal text | landed | PASS |
| reviewer.md effort: medium | frontmatter `effort: medium` (single line) | landed | PASS |
| security-reviewer.md effort: medium | frontmatter `effort: medium` (single line) | landed | PASS |
| advisor.md effort UNCHANGED (control) | frontmatter `effort: high` | unchanged | PASS |
| CONTEXT.md D-04 amendment 2026-05-02 | block citing Anthropic Best Practices + April 23 postmortem + reversion criterion | landed | PASS |
| D-reviewer-budget.sh bash -n | exits 0 | exits 0 | PASS |
| D-security-reviewer-budget.sh bash -n | exits 0 | exits 0 | PASS |
| Plugin version 0.12.0 across 5 surfaces | plugin.json + 4 SKILL.md frontmatter | landed | PASS |
| REQUIREMENTS.md GAP-D-budget-empirical row | new row + traceability entry | landed | PASS |
| No non-ASCII bytes in any modified surface | rg `[\x80-\xff]` returns 0 | 0 | PASS |
| No emoji severity prefixes leaked | `git grep -F "..."` returns 0 for each emoji | 0 | PASS |

The smoke fixture path-d-equivalent assertion (aggregate <=300w against agent output on canonical scenario) structurally validates the gap closure path: when the agent emits aggregate <=300w, FAIL=0 and exit 0 (PASS).

### Empirical verification (deferred)

The empirical closure criterion -- a fresh UAT replay subset (minimum: review skill + security-review skill on canonical Compodoc + Storybook scenario per Phase 6 amendment 5 + Phase 7 Plan 07-07/07-08 deferred-empirical precedent) on plugin 0.12.0 confirming aggregate <=300w in 8 of 8 sessions AND <=15% Class-1 recall drop vs xhigh baseline -- is OUT of Plan 07-09 scope. The structural surfaces are in place; behavioral confirmation lands in the next phase's UAT replay if Phase 7 is sealed before then, or in a follow-up empirical-validation cycle. If empirical recall drop exceeds 15%, REVERT D-04 amendment 2026-05-02 per the binding reversion criterion (revert effort to xhigh, keep Candidate A fragment grammar).

### Closure scope

- **GAP-D-budget-empirical: CLOSED structurally** at the contract surface (Candidates A + B) AND the smoke fixture surface (Task 3 parser update) AND the version-bump surface (Task 4 plugin 0.12.0).
- The Phase 8 candidates (out-of-phase residuals 3, 4, 5 per 07-VERIFICATION.md) remain deferred to a hypothetical Phase 8.

### Phase 7 sealing readiness (updated)

With Gap 1 CLOSED structurally (Plan 07-07 amendment) + Gap 2 CLOSED structurally (Plan 07-08 amendment) + GAP-D-budget-empirical CLOSED structurally (this amendment), Phase 7 is now READY TO SEAL as **PASS-with-residual** -- core within-phase gaps (1 + 2 + D-budget-empirical) closed at the contract + smoke + version layers; out-of-phase residuals (3, 4, 5) and 22 Phase 8 candidates handed off to a hypothetical Phase 8 per `06-VERIFICATION.md` Amendment 6.
