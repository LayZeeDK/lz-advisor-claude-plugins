---
phase: 12-atomic-grouped-grammar-rewrite
reviewed: 2026-06-07T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - plugins/lz-advisor/agents/reviewer.md
  - plugins/lz-advisor/agents/security-reviewer.md
  - plugins/lz-advisor/skills/review/SKILL.md
  - plugins/lz-advisor/skills/security-review/SKILL.md
  - plugins/lz-advisor/skills/execute/SKILL.md
  - plugins/lz-advisor/references/context-packaging.md
  - tests/D-reviewer-budget.sh
  - tests/D-security-reviewer-budget.sh
  - plugins/lz-advisor/.claude-plugin/plugin.json
  - plugins/lz-advisor/skills/plan/SKILL.md
  - plugins/lz-advisor/README.md
findings:
  critical: 0
  warning: 5
  info: 2
  total: 7
status: issues_found
---

# Phase 12: Code Review Report

**Reviewed:** 2026-06-07
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 12 converted the two review agents (`reviewer.md`, `security-reviewer.md`) and their two skills from inline `crit:`/`imp:`/`sug:`/`q:` fragment shorthand to findings GROUPED under `### Critical` / `### Important` / `### Suggestions` / `### Questions` headers, retargeted both bash budget fixtures to the new header-tracking parser, synced context-packaging + the two skills' render-verbatim contracts, and bumped the version 1.0.0 -> 1.0.1 across 5 surfaces plus a README changelog entry.

The mechanical conversion is largely clean and was empirically validated: both fixtures pass green in self-extract mode (reviewer 10/10, security 9/9), both `--self-test` anti-vacuous inversions fire correctly (exit 1 by design), the RED-on-old-grammar replay trips the anti-vacuous guard as documented, CRLF normalization works on both fixtures, the security fixture's `[Axx]` bracket assertion correctly drops unbracketed findings, and the CVE auto-clarity 75w carve-out fires. No non-ASCII characters, no surviving `crit:`/`imp:`/`sug:`/`q:` shorthand, no `(formerly High)`/`(formerly Medium)` residue, all `<verify_request severity="...">` attrs lowercase, and the `### Cross-Cutting Patterns` / `### Threat Patterns` trailing sections remain. Version 1.0.1 is consistent across all 5 surfaces.

However, five WARNING-level defects survive: (1) the REQUIRED `### Cross-Cutting Patterns` budget gate in the reviewer fixture passes VACUOUSLY when the header is absent or drifts -- an asymmetry the security fixture explicitly closed for its `### Threat Patterns` gate; (2) the same reviewer gate's `$`-anchored awk pattern silently zeroes the body on a trailing-space header; (3) BOTH holistic worked examples number their findings in a way that directly contradicts the prose numbering rule (a few-shot-drift contradiction -- the WR-05 class this phase exists to prevent); (4) a dangling cross-reference: the security-reviewer agent (line edited THIS phase) points the executor at a `security-review/SKILL.md "Reviewer Escalation Hook"` section that does not exist; (5) a self-contradiction in the security-reviewer's Hedge Marker Discipline (a line edited THIS phase) instructs the forbidden `Pending verification of` paraphrase that the same section forbids three lines earlier.

## Warnings

### WR-01: Reviewer fixture passes VACUOUSLY when the REQUIRED `### Cross-Cutting Patterns` header is missing or drifts

**File:** `tests/D-reviewer-budget.sh:241-252`

**Issue:** The reviewer agent's contract makes `### Cross-Cutting Patterns` a MANDATORY trailing header (`reviewer.md:53`, `:66`, `:186`: "The header is MANDATORY even when the section body is short; the skill's parser requires it."). The fixture extracts that section's body with `awk '/^### Cross-Cutting Patterns$/{c=1;next} /^### Missed surfaces/{c=0} c'` and then asserts `<= 160` words -- but performs NO presence pre-check. When the required header is entirely absent, the extraction yields an empty body, `wc -w` returns 0, and the check passes GREEN ("Cross-Cutting Patterns budget: 0 <= 160"). Proven empirically: a `--from-trace` input with 5 valid findings and NO Cross-Cutting Patterns header returns `Status: [PASS] -- all assertions passed` (exit 0). This is the exact vacuous-pass / WR-03 failure mode the fixture's own header comments (lines 142-143) claim to guard against, and the security fixture explicitly closed for its `### Threat Patterns` gate (security `:256-267` fails loudly via `END{exit !found}` when the required heading is missing). The reviewer half is the weaker, asymmetric one: a future agent regression that drops the mandatory header would slip past the gate.

**Fix:** Mirror the security fixture's required-heading presence pre-check before computing the budget:
```bash
if printf '%s\n' "$REPORT" | awk '/^### Cross-Cutting Patterns/{found=1} END{exit !found}'; then
  # ... existing extraction + budget assertion ...
else
  fail "Cross-Cutting Patterns: REQUIRED '### Cross-Cutting Patterns' heading not found" \
    "heading drift would zero the body into a vacuous pass -- failing loudly instead"
fi
```

### WR-02: Reviewer fixture's `$`-anchored Cross-Cutting Patterns extraction silently zeroes the body on a trailing-space header

**File:** `tests/D-reviewer-budget.sh:243`

**Issue:** The awk start pattern `/^### Cross-Cutting Patterns$/` is byte-exact-anchored at end-of-line. A header that drifts to `### Cross-Cutting Patterns ` (trailing space) fails the `$` anchor, the body extraction yields empty, and the budget check passes vacuously (0 <= 160) even when the actual body far exceeds 160 words. Proven empirically: a `--from-trace` input with a trailing-space header and a >160-word body still returns exit 0 / all-pass. The fixture's own comments (lines 142-143) explicitly mandate "TOLERANT anchored matches... not byte-exact equality, so a trailing space / surviving CR / heading drift does not silently zero the parse (WR-03 / Pitfall 3 lesson)" -- but this extraction violates that rule. The security fixture used the tolerant non-`$`-anchored form (`extract_section '^### Threat Patterns'`, security `:244-251`) precisely to absorb trailing variation. (The companion Missed-surfaces extraction at reviewer `:262` shares the issue but is OPTIONAL, so an empty body there is tolerable; the REQUIRED Cross-Cutting Patterns section is the load-bearing case.)

**Fix:** Drop the `$` anchor to match the security fixture's tolerant style and pair it with the WR-01 presence pre-check, so a drifted header is caught by the explicit presence check rather than zeroing the body:
```bash
# tolerant prefix match, no $ anchor
| awk '/^### Cross-Cutting Patterns/{c=1;next} /^### Missed surfaces/{c=0} c'
```

### WR-03: Both holistic worked examples number findings in an order that contradicts the prose numbering rule (few-shot drift)

**File:** `plugins/lz-advisor/agents/reviewer.md:94` vs `:152-170`; `plugins/lz-advisor/agents/security-reviewer.md:95` vs `:160-178`

**Issue:** Both agents state the numbering rule as: "The leading `N.` is a CONTINUOUS integer assigned in document order across ALL sections (**Critical's findings numbered first, then Important, then Suggestions, then Questions**)." But the holistic worked examples assign numbers by CURATION/DISCOVERY order, NOT by section-render order:
- reviewer holistic: Critical = findings 1, 2, **5**; Important = 3, 6; Suggestions = 4; Questions = 7.
- security holistic: Critical = 2, 4, 6; Important = 1, 3; Questions = 5.

If numbering were truly "assigned in document order across ALL sections, Critical's findings numbered first," then Critical's three findings would be 1, 2, 3 (numbered first), not `1,2,5` (reviewer) or `2,4,6` (security). The examples instead carry forward the pre-assigned numbers from the four standalone single-examples (reviewer `:123,:131,:139,:148` pre-assign 1/4/3/5; security `:127,:135,:143,:150,:154` pre-assign 1/2/5/3/6). This is a direct legend-vs-example contradiction -- the few-shot-drift defect class (WR-05) this phase exists to prevent. A model following the prose rule produces `1,2,3 | 4,5 | 6 | 7`; a model following the examples produces discovery-order numbering. The two interpretations diverge, and an Opus reviewer pattern-matching on the (more salient) worked example will not match the prose rule. Both fixtures parse either interpretation (FINDING_RE only requires `^[0-9]+\.`), so this is not caught by the gate -- it is a latent prompt-quality contradiction.

**Fix:** Reconcile the prose to describe what the examples actually demonstrate. The examples number findings in the order the executor curated them and place each under its severity header; numbers are continuous and unique but NOT section-ordered. Reword line 94 / line 95 to: "The leading `N.` is a CONTINUOUS integer assigned in the order findings were curated (continuous and unique across the whole response; do NOT restart numbering per section). The number travels WITH the finding into whichever severity section it belongs; the section render order does not renumber." Drop the parenthetical "(Critical's findings numbered first, then Important...)" which the examples falsify.

### WR-04: Dangling cross-reference -- security-reviewer agent points at a non-existent `security-review/SKILL.md "Reviewer Escalation Hook"` section

**File:** `plugins/lz-advisor/agents/security-reviewer.md:340`

**Issue:** The Class-2 Escalation Hook section (rewritten THIS phase -- diff line 245 carries a `+` prefix) instructs: "The executor parses your `<verify_request>` blocks during the security-review skill's Phase 3 (Output) per `security-review/SKILL.md` 'Reviewer Escalation Hook' section." No such section exists in `security-review/SKILL.md` -- the only escalation/verify_request handling lives in `review/SKILL.md:189-205`. The security-review skill's Phase 3 (`security-review/SKILL.md:148-185`) renders the agent's response VERBATIM with no verify_request scan/parse/re-invoke flow. Consequently any `<verify_request>` block the security-reviewer emits (which the agent is explicitly told to produce for Class 2-S CVE/advisory questions, and the holistic example DOES emit at `:178`) is rendered raw to the user instead of triggering the one-shot npm-audit/WebFetch escalation the agent promises. `context-packaging.md:373` acknowledges the gap ("security-review/SKILL.md ... not yet wired in current scope"), but the agent prose asserts the wiring exists -- a false instruction the executor cannot follow. Because Phase 12 actively rewrote this line, reconciling the reference (or softening it to "if wired") was in scope and was missed.

**Fix:** Either (a) wire the escalation hook into `security-review/SKILL.md` Phase 3 mirroring `review/SKILL.md:189-205` (with the Class 2-S `npm audit --json` -> GHSA WebFetch pre-pass), OR (b) correct the agent prose to match reality, e.g.: "The executor renders your `<verify_request>` blocks verbatim; the security-review skill does not yet perform the one-shot escalation flow (tracked separately). Emit the block so the user sees the unresolved question." Do not leave the agent asserting a handler the skill lacks.

### WR-05: Security-reviewer Hedge Marker Discipline self-contradiction -- forbids `Pending verification:` then mandates it

**File:** `plugins/lz-advisor/agents/security-reviewer.md:396` vs `:400`

**Issue:** Line 396 states: "Do not paraphrase the frame as `Pending verification:`, `Hedge unresolved:`, `Outstanding verification:`, or any softer variant -- the executor greps for the literal `Unresolved hedge:` token to route the item to verification." Three lines later, line 400 (rewritten THIS phase -- diff line 257 carries a `+` prefix, adapting `### Findings` to the grouped severity sections) instructs the opposite for security-clearance hedges: "the frame attaches to the corresponding finding entry (placed under `### Suggestions` while the threat is unconfirmed) as a severity downgrade rationale: `'Pending verification of <hedge action>.'`" This is exactly the `Pending verification:` paraphrase line 396 forbids. A security-reviewer following line 400 emits `Pending verification of X` instead of the grep-able `Unresolved hedge:` token, so the executor's literal-token routing (and the skill's sentinel-pattern greps) silently miss the item -- the hedge never reaches verification. Phase 12 edited this line and had the opportunity to reconcile the conflict but preserved the forbidden form.

**Fix:** Make line 400 use the canonical grep-able frame and let the SECTION PLACEMENT carry the downgrade, not a forbidden paraphrase. For example: "...the finding is placed under `### Suggestions` while the threat is unconfirmed, and the `### Suggestions` entry carries the canonical `Unresolved hedge: <marker>. Verify <action> before committing.` frame as its `<fix>` clause. Move the finding up to `### Important` or `### Critical` if verification confirms the threat." This preserves the severity-downgrade behavior while keeping the executor-grep-able token intact.

## Info

### IN-01: Reviewer fixture auto-clarity carve-out is silently absent (by design) but undocumented as a divergence risk

**File:** `tests/D-security-reviewer-budget.sh:217-229` vs `tests/D-reviewer-budget.sh:228-235`

**Issue:** The security fixture applies a 75w auto-clarity carve-out for CVE/GHSA/CWE findings; the reviewer fixture intentionally does not (reviewer `:228` comment: "No auto-clarity carve-out in the reviewer fixture (that is security-only)"). This is correct per the agents -- only `security-reviewer.md` defines `auto_clarity_cap="75"`; `reviewer.md`'s `<output_constraints>` has no auto-clarity attribute. However, the security fixture's carve-out detection (`[[ "$body" =~ \[(CVE|GHSA|CWE) ]]`) silently depends on the OWASP `[Axx]` tag being the FIRST bracket so the CVE/GHSA/CWE appears as a SECOND bracket surviving into the body. If the agent ever emits a CVE-only finding leading with `[CVE-...]` as the OWASP-position bracket (a plausible drift -- CVE findings map to A06 but a model might lead with the more specific tag), the body-strip consumes the CVE bracket as the prefix, auto-clarity does NOT fire, and a legitimate full-prose CVE finding gets a false FAIL against the 28w cap. Proven empirically: a finding `1. pkg:0: [CVE-2025-9999] <43-word body>` fails with "per-entry budget exceeded: 43 > 28". The agent's contract (security `:95`) does require the OWASP tag first, so a conforming agent never triggers this -- but the fixture's correctness rests on an unstated invariant.

**Fix:** Either harden detection to also fire on a leading CVE/GHSA/CWE bracket (run the auto-clarity regex against the FULL line before the OWASP-prefix strip), or add an explicit comment that the fixture assumes the OWASP `[Axx]` tag always precedes any `[CVE-...]` bracket per the agent's `:95` contract, so the invariant is documented rather than latent.

### IN-02: README "What's New 1.0.1" describes a behavior change but the package surface is documentation-only

**File:** `plugins/lz-advisor/README.md:79-90`

**Issue:** The 1.0.1 changelog entry is accurate and well-written (grouped headers, continuous numbering, `(none)` markers, OWASP `[Axx]` preservation, render-verbatim + per-section budget intact). Minor: it states the agents "now present findings GROUPED" -- since this plugin ships only Markdown prompt contracts (no runtime), the change is entirely a prompt-grammar contract change, not executable behavior. The phrasing is fine for end users; flagging only for precision since the project is prompt-only and "present findings" implies runtime behavior that is actually model-emitted output shape. No action required unless precision is desired.

**Fix:** Optional -- no change needed. If desired, "the `/review` and `/security-review` agents are now instructed to present findings GROUPED..." makes the prompt-contract nature explicit.

---

_Reviewed: 2026-06-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
