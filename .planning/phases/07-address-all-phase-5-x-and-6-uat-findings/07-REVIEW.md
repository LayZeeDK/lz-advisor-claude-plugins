---
phase: 07-address-all-phase-5-x-and-6-uat-findings
reviewed: 2026-05-02T22:30:04Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - plugins/lz-advisor/agents/reviewer.md
  - plugins/lz-advisor/agents/security-reviewer.md
  - plugins/lz-advisor/references/context-packaging.md
  - plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.review/SKILL.md
  - plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-05-02T22:30:04Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Reviewed Plan 07-09 changes plus byte-identical version-stamp bumps (0.11.0 -> 0.12.0) across plugin.json and the four SKILL.md files. The core substantive changes live in `agents/reviewer.md` and `agents/security-reviewer.md`: a fragment-grammar emit template (Pillar / Issue / Severity / Fragment / Rationale shape) was added under `## Output Constraint`, and `effort` was de-escalated from `xhigh` to `medium`. References (`context-packaging.md`) and the four SKILL.md files were not substantively modified at the prose level for this plan; their role here is the version-stamp bump.

The fragment-grammar rewrite is structurally sound and the smoke fixture `D-reviewer-budget.log` shows enforcement passes (Findings <=80w per entry, aggregate <=300w). The substantive concerns surfaced below are all about cross-file consistency drift introduced by the rewrite -- specifically severity-vocabulary divergence between the security-reviewer agent and the security-review skill, and inter-file structural asymmetry (security-reviewer.md misses the `## Class-2 Escalation Hook` section reviewer.md owns). No security vulnerabilities, no broken contract semantics that would crash a run -- the issues degrade output coherence but do not block phase closure.

## Warnings

### WR-01: security-reviewer severity vocabulary internally inconsistent

**File:** `plugins/lz-advisor/agents/security-reviewer.md:66-67, 284`
**Issue:** Lines 66-67 rename the per-finding severity prefix vocabulary: `imp:` is annotated "Important (formerly High)" and `sug:` is "Suggestion (formerly Medium)". The fragment-grammar examples (lines 100, 108, 116, 123, 127) and the holistic worked example (lines 135-141) all use the new `crit:` / `imp:` / `sug:` / `q:` prefixes consistently. However, line 284 (in the `## Hedge Marker Discipline` section, security-clearance carve-out) still references the legacy vocabulary verbatim: `'Severity: Medium pending verification of <hedge action>.' Severity escalates if verification confirms the threat; until then, the hedge prevents premature high-severity classification.` An agent reading the file end-to-end sees two different severity ladders: the new one in `## Output Constraint`, the old one in `## Hedge Marker Discipline`. The agent is told to emit `sug:` (Suggestion / formerly Medium) but also told to write "Severity: Medium" in security-clearance hedge cases.
**Fix:**
```
Replace line 284's literal severity strings:
- "Severity: Medium" -> "Severity: Suggestion" (or "Severity: imp:" if the
  intended ladder rung is Important; the original "Medium" in the legacy
  ladder mapped to today's "Suggestion" per line 67's rename annotation)
- "premature high-severity classification" -> "premature important-severity classification"

Concretely, line 284 becomes:
  When the unresolved hedge concerns a security-clearance question (CVE /
  supply-chain / advisory / authentication / authorization), the frame
  attaches to the corresponding `### Findings` entry as a severity
  downgrade rationale: 'Severity: Suggestion pending verification of
  <hedge action>.' Severity escalates if verification confirms the
  threat; until then, the hedge prevents premature important-severity
  classification.
```

### WR-02: security-reviewer severity ladder mismatched with security-review SKILL.md and context-packaging.md

**File:** `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md:126, 164`; `plugins/lz-advisor/references/context-packaging.md:275, 374`
**Issue:** The security-reviewer agent (`agents/security-reviewer.md` lines 65-68) renamed the severity ladder from `Critical / High / Medium` to `Critical / Important / Suggestion` (matching the reviewer agent's ladder). The downstream skill and reference files were NOT updated. `lz-advisor.security-review/SKILL.md:126` still tells the executor to "include an initial severity assessment (Critical / High / Medium)". `SKILL.md:164` still tells the user the agent emits "severity groups (Critical / High / Medium)". `references/context-packaging.md:275` (Verification template) still labels security-review's initial severity slot "Critical/High/Medium". `references/context-packaging.md:374` (verify_request severity attribute) still defines security-reviewer values as "Critical / High / Medium". Net effect: the executor packages findings with `severity: "High"` but the agent emits `imp:` and labels them "Important"; downstream tooling and humans see inconsistent severity labels for the same finding. This was NOT touched by Plan 07-09 (which scoped the rewrite to the agent file only) but is a contract-shape mismatch the rewrite introduced.
**Fix:**
```
Either:
(a) Update the 4 SKILL.md / context-packaging.md occurrences to match the
    new ladder (Critical / Important / Suggestion), OR
(b) Roll back the rename in agents/security-reviewer.md lines 66-67 (drop
    the "(formerly High)" / "(formerly Medium)" annotations and align the
    `imp:` and `sug:` keys back to High / Medium severity descriptors).

Concrete edits for option (a) (preserves the rewrite's intent):

- SKILL.md:126: "(Critical / High / Medium)" -> "(Critical / Important / Suggestion)"
- SKILL.md:164: "(Critical / High / Medium)" -> "(Critical / Important / Suggestion)"
- context-packaging.md:275: "Critical/High/Medium for security-review" ->
                            "Critical/Important/Suggestion for security-review"
- context-packaging.md:374: "Critical / High / Medium for security-reviewer" ->
                            "Critical / Important / Suggestion for security-reviewer"

Recommendation: option (a) -- the rewrite is the load-bearing change and
aligning the auxiliary surfaces is cheaper than reverting the agent.
```

### WR-03: security-reviewer.md references reviewer.md for the `## Class-2 Escalation Hook` protocol

**File:** `plugins/lz-advisor/agents/security-reviewer.md:119, 129`
**Issue:** Line 119 of security-reviewer.md says `The <verify_request> block (Plan 07-05 Class-2 escalation hook, see ## Class-2 Escalation Hook in reviewer.md and adapted here for Class 2-S security questions) trails the affected finding line as a separate line, as shown in example 3 above.` The cross-file reference assumes the security-reviewer agent has reviewer.md in context, but agents are stateless: each agent invocation only loads its own file. Worse, line 129's carve-out enumerates which sections it "preserves byte-identically": `## OWASP Top 10 Lens`, `## Context Trust Contract`, `## Threat Modeling`, `## Hedge Marker Discipline`, `## Boundaries`. The list omits any equivalent of reviewer.md's `## Class-2 Escalation Hook` section, even though the security-reviewer agent IS expected to emit Class-2 / 2-S / 3 verify_request blocks (the worked example on line 117 emits one). The agent has the verify_request schema example but no canonical instructions on when to emit, where to place inside `### Findings`, what classes are valid, or the one-shot re-invocation expectation.
**Fix:**
```
Add a `## Class-2 Escalation Hook` section to security-reviewer.md (after
the existing `## Threat Modeling` section, before `## Final Response
Discipline` -- mirroring reviewer.md's structure). Adapt reviewer.md's
canonical text:

  - Replace "Class-2" / "Class-3" with "Class-2 / 2-S / 3" since
    security-reviewer is the primary emitter of `class="2-S"` blocks.
  - Reference references/context-packaging.md "Verify Request Schema"
    and `lz-advisor.security-review/SKILL.md` Phase 3 for the executor-
    side flow (note: lz-advisor.security-review/SKILL.md does not yet
    have a `### Reviewer Escalation Hook` analog; this gap is a
    separate finding -- IN-02 below).
  - Drop the cross-file `see ## Class-2 Escalation Hook in reviewer.md`
    pointer on line 119; replace with `see ## Class-2 Escalation Hook
    below`.

Alternatively (less preferred), inline a self-contained 5-line summary
of the verify_request emit protocol on line 119+ in lieu of a full
section. The full-section approach matches reviewer.md's structure and
is more discoverable to the agent.
```

### WR-04: per-section sub-caps inside the 300w aggregate are over-allocated

**File:** `plugins/lz-advisor/agents/reviewer.md:69, 158`; `plugins/lz-advisor/agents/security-reviewer.md:72, 163`
**Issue:** Both agents declare "Aggregate Findings section <=250 words" (reviewer line 69, security-reviewer line 72) AND "Aggregate cap: <=300 words across `### Findings` + `### Cross-Cutting Patterns` + `### Missed surfaces` combined" (reviewer line 158, security-reviewer line 163). Combined, these constraints leave only 50w for Cross-Cutting Patterns + Missed surfaces. Yet the holistic worked example in reviewer.md line 144 shows `Cross-Cutting Patterns ~85w, Missed surfaces ~25w` (110w combined; over the 50w residual budget). The security-reviewer worked example on line 151 shows `Threat Patterns ~90w, Missed surfaces ~20w` (110w combined; same overage). The example "fits" only because Findings stayed at 110-155w (well below the 250w sub-cap), but the agent receiving this guidance could correctly maximize Findings to 250w and then over-budget the aggregate. The smoke fixture `D-reviewer-budget.log` confirms the empirical contract is per-entry <=80w + Cross-Cutting <=160w + Missed surfaces <=30w + aggregate <=300w -- so the runtime contract differs from the agent prose. The 250w Findings cap in agent prose is unused / contradicts the smoke fixture.
**Fix:**
```
Either align the agent prose to the smoke fixture (preferred -- smoke
fixture is the executable contract):

- reviewer.md line 69: drop "Aggregate Findings section <=250 words"
  trailing sentence. Replace with "Per-finding entry word target: <=20
  words for the problem + fix combined; per-entry hard cap: <=80 words
  (smoke-fixture-enforced)."
- reviewer.md line 158 already states the aggregate <=300w cap and
  references the smoke fixture; expand to surface the per-section
  sub-caps the smoke fixture actually enforces:
  "Aggregate cap: <=300 words across `### Findings` + `### Cross-Cutting
   Patterns` + `### Missed surfaces` combined. Per-section sub-caps
  enforced by D-reviewer-budget.sh: each Findings entry <=80w,
  Cross-Cutting Patterns <=160w, Missed surfaces <=30w."
- security-reviewer.md lines 72 and 163: apply the same edit pattern
  with the security-reviewer's smoke fixture
  (D-security-reviewer-budget.sh) and section names (Threat Patterns).

Or if the 250w Findings sub-cap is intentional and the smoke fixture is
the wrong shape: update D-reviewer-budget.sh and
D-security-reviewer-budget.sh to assert <=250w on Findings and <=50w
on Cross-Cutting + Missed combined. (Less preferred -- the worked
examples already overshoot 50w.)
```

## Info

### IN-01: 4 SKILL.md files share ~50 lines of byte-identical `<context_trust_contract>` block

**File:** `plugins/lz-advisor/skills/lz-advisor.execute/SKILL.md:40-73`; `plugins/lz-advisor/skills/lz-advisor.plan/SKILL.md:37-70`; `plugins/lz-advisor/skills/lz-advisor.review/SKILL.md:38-71`; `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md:39-72`
**Issue:** The `<context_trust_contract>` block (~50 lines including the ToolSearch availability rule, the two worked examples, and the pv-* synthesis precondition) is byte-identical across all four SKILL.md files. Same for the `<orient_exploration_ranking>` block (~17 lines, lines 75-89 in execute / 72-86 in plan / 73-87 in review / 74-88 in security-review). Each version-stamp bump (0.11.0 -> 0.12.0 here) requires touching all four files; future edits to the trust contract risk drift. This is a duplication smell (~250 lines of byte-identical content across 4 files), not a bug.
**Fix:**
```
Extract the shared blocks into references/orient-trust-contract.md and
have each SKILL.md include via @${CLAUDE_PLUGIN_ROOT} reference, mirroring
the existing pattern with references/context-packaging.md and
references/advisor-timing.md. The trade-off: SKILL.md descriptions are
already long, but Claude Code resolves @ references at load time, so the
agent's effective prompt size is unchanged. The benefit is single-source-
of-truth for trust-contract edits -- one version bump touch point instead
of four.

Defer to the user; this is a maintenance hygiene improvement, not a
runtime issue.
```

### IN-02: lz-advisor.security-review/SKILL.md has no `### Reviewer Escalation Hook` analog

**File:** `plugins/lz-advisor/skills/lz-advisor.security-review/SKILL.md:148-183`
**Issue:** lz-advisor.review/SKILL.md (lines 188-204) defines a `### Reviewer Escalation Hook` section in its Phase 3 output that parses `<verify_request>` blocks emitted by the reviewer agent, performs the verifications, synthesizes pv-* anchors, and re-invokes once. lz-advisor.security-review/SKILL.md has no equivalent section. The security-reviewer agent CAN emit `<verify_request class="2-S">` blocks (per security-reviewer.md line 117 worked example, and per references/context-packaging.md:357 cross-reference), but the security-review skill has no documented executor-side handling protocol. The reference's own line 357 acknowledges this gap: `the corresponding executor-side flow is documented in each skill's <output> block (see lz-advisor.review/SKILL.md "Reviewer Escalation Hook" and lz-advisor.security-review/SKILL.md -- not yet wired in current scope; reviewer-side wiring lands in Plan 07-05).` Plan 07-05 closed reviewer-side; security-review is the documented gap.
**Fix:**
```
Add a `### Security-Reviewer Escalation Hook` section to
lz-advisor.security-review/SKILL.md Phase 3, mirroring the reviewer
skill's structure. Differences:

- Step 2 verification: for class="2-S" requests, run `npm audit --json`
  + WebFetch https://github.com/advisories?query=<package>` (per
  context-packaging.md:195 already-documented sub-pattern).
- Reference references/context-packaging.md "Verify Request Schema" for
  the block shape.
- Same one-shot re-invocation rule as the reviewer skill.

This is OUT OF SCOPE for the Plan 07-09 word-budget regression closure
but should be tracked as a follow-up. The security-reviewer agent's
Phase 7 changes (effort de-escalation + fragment-grammar rewrite) make
this gap more salient because the agent now has fewer turns to resolve
Class-2 ambiguity itself, increasing the rate at which it will emit
verify_request blocks the executor cannot handle.
```

### IN-03: caveman empirical baseline cited via absolute Windows path

**File:** `plugins/lz-advisor/agents/reviewer.md:158`; `plugins/lz-advisor/agents/security-reviewer.md:163`
**Issue:** Both agent files reference `D:\projects\JuliusBrussee\caveman` as the empirical baseline source for the 65% mean output reduction claim. This is a hard-coded developer-machine absolute path that other contributors cannot resolve, and that ships in the published plugin (the agent file is the agent's actual prompt content). Users of the plugin will see this path in their agent's system prompt with no way to access the cited source. The cross-reference adds no actionable value to a non-author agent invocation -- the agent does not need to validate the empirical claim; it just needs to follow the budget.
**Fix:**
```
Either:
(a) Drop the parenthetical entirely: "the fragment-grammar shape binds
    output length structurally rather than describing it." (cleanest --
    the empirical justification belongs in the plan/research artifacts,
    not the agent's running prompt).
(b) Replace with a public/portable reference: "(see Plan 07-09 for the
    fragment-grammar rationale and empirical baseline)."
(c) If the public baseline matters, link to a published artifact (npm
    package, GitHub repo, blog post) rather than a local checkout path.

Recommendation: option (b). It preserves the empirical-grounding signal
while keeping the agent prompt portable.
```

---

_Reviewed: 2026-05-02T22:30:04Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
