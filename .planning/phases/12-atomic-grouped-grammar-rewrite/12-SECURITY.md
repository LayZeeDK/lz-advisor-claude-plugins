---
phase: 12
slug: atomic-grouped-grammar-rewrite
status: secured
threats_open: 0
asvs_level: 1
created: 2026-06-08
---

# SECURITY.md -- Phase 12: atomic-grouped-grammar-rewrite

**Phase:** 12 -- atomic-grouped-grammar-rewrite
**ASVS Level:** 1
**Block-on:** high
**Audit date:** 2026-06-08
**Implementation under audit (READ-ONLY):**

- `plugins/lz-advisor/agents/reviewer.md`
- `plugins/lz-advisor/agents/security-reviewer.md`
- `plugins/lz-advisor/skills/review/SKILL.md`
- `plugins/lz-advisor/skills/security-review/SKILL.md`
- `plugins/lz-advisor/references/context-packaging.md`
- `plugins/lz-advisor/.claude-plugin/plugin.json`
- `plugins/lz-advisor/README.md`
- `tests/D-reviewer-budget.sh`
- `tests/D-security-reviewer-budget.sh`

**Result:** SECURED -- 14/14 threats closed (12 mitigate verified in code, 2 accepted risks logged).

This is a zero-runtime Markdown/YAML/bash phase. The "threats" are integrity (Tampering)
and Repudiation threats about prompt-contract controls surviving a severity-grammar rewrite:
a control dropped silently during the rewrite = Tampering; a budget gate that passes
vacuously (zero findings parsed yet exits green) = Repudiation. Every mitigation below was
re-found by direct `git grep` / Read against the CURRENT committed implementation. The two
budget fixtures were additionally EXECUTED to confirm the structural controls actually fire
(GREEN-on-new + self-test RED), not merely that the source looks correct. SUMMARY /
VERIFICATION claims were NOT accepted as evidence.

---

## Threat Verification

| Threat ID | Category               | Disposition | Status | Evidence |
|-----------|------------------------|-------------|--------|----------|
| T-12-01   | Tampering              | mitigate    | CLOSED | reviewer.md `## Class-2 Escalation Hook` (count 1) + `## Hedge Marker Discipline` (count 1) present post-rewrite. See detail below. |
| T-12-02   | Tampering              | mitigate    | CLOSED | reviewer.md `severity="` values lowercase only: `severity="important"` (:144, :162), BNF `severity="<critical|important|suggestion>"` (:314). No Title-Case. |
| T-12-03   | Repudiation            | mitigate    | CLOSED | D-reviewer-budget.sh `MIN_FINDINGS=5` (:43); anti-vacuous guard (:214-219) BEFORE the budget loop (:228); zero-finding exits 1; self-test RED + RED-on-old documented (:194-213). |
| T-12-04   | Repudiation            | mitigate    | CLOSED | D-security-reviewer-budget.sh `FINDING_RE` asserts `\[[^]]+\] ` after location (:143); `[Axx]` preserved after location in agent examples (security-reviewer.md :127,:135,:143,:150,:154,:162-164,:168-169,:177). |
| T-12-05   | Information disclosure | mitigate    | CLOSED | D-security-reviewer-budget.sh `AUTO_CLARITY_CAP=75` (:46); carve-out fires via `[[ "$body" =~ \[(CVE|GHSA|CWE) ]]` (:220-222); worked CVE example `[A06] [CVE-2025-1234]` retained (security-reviewer.md :154,:164). Live run: CVE finding `36 <= 75` (would fail 28w default). |
| T-12-06   | Tampering              | mitigate    | CLOSED | security-reviewer.md `## Class-2 Escalation Hook` (count 1), `## Hedge Marker Discipline` (count 1), `## OWASP Top 10 Lens` (count 1); `severity="` lowercase only (:144,:178,:327). |
| T-12-07   | Repudiation            | mitigate    | CLOSED | D-security-reviewer-budget.sh `MIN_FINDINGS=5` (:44); anti-vacuous guard (:202-207) BEFORE the budget loop (:217); self-test RED (:181-192); RED-on-old + [Axx]-missing documented (:194-201). |
| T-12-08   | Tampering              | mitigate    | CLOSED | Both skills name the four severity headers + trailing section as protected literal headers that MUST reach the user (review :165,:175,:178-181; security-review :151,:161,:164-168); old "reformat into severity groups" prohibition GONE; render-verbatim absolute. See detail below. |
| T-12-09   | Tampering              | mitigate    | CLOSED | context-packaging.md `severity="` lowercase only: BNF `severity="<critical|important|suggestion>"` (:378), worked example `severity="important"` (:402). No Title-Case leak. |
| T-12-10   | Spoofing/Tampering     | mitigate    | CLOSED | context-packaging.md INPUT-side Verification template `Severity (initial): [Critical/Important/Suggestion for review;` (:290) survives UNCONVERTED (KEPT, not grouped); no shorthand introduced. |
| T-12-11   | Tampering              | mitigate    | CLOSED | Exactly 5 hits at 1.0.1 (plugin.json :3 + plan/execute/review/security-review SKILL.md version: fields); zero at 1.0.0; README `### 1.0.1` (:79) present. |
| T-12-12   | Repudiation            | mitigate    | CLOSED | `git grep -nE 'crit:\|imp:\|sug:\|q:' -- plugins/lz-advisor/` returns NOTHING; `formerly High\|formerly Medium` returns NOTHING. The only crit: hits under tests/ are #-prefixed history comments (allowed exception). |
| T-12-13   | Tampering              | accept      | CLOSED | Accepted-risks log entry AR-1 below. |
| T-12-SC   | Tampering              | accept      | CLOSED | Accepted-risks log entry AR-2 below. |

---

## Mitigation evidence detail

All evidence below was re-found by direct `git grep` / Read against the CURRENT committed
state of the implementation files. Line numbers are at the audited HEAD. Where a control is
behavioral (a gate that must FIRE), the fixture was also executed.

### Reviewer agent (T-12-01, T-12-02)

- **T-12-01 (Class-2 + Hedge survive):** `git grep -c '^## Class-2 Escalation Hook$'
  plugins/lz-advisor/agents/reviewer.md` = 1; `git grep -c '^## Hedge Marker Discipline$' ...`
  = 1. Both protected sections survive the grammar rewrite byte-intact.
- **T-12-02 (lowercase severity= machine attribute):** the only `severity="` occurrences in
  reviewer.md are `severity="important"` (the two verify_request worked examples, :144 and
  :162) and the BNF `severity="<critical|important|suggestion>"` (:314). No Title-Case value
  exists, so the executor's verify_request parsing is not broken. The four grouped display
  headers `### Critical` / `### Important` / `### Suggestions` / `### Questions` (:69,:73,:77,
  :81) are Title-Case display surfaces, distinct from the lowercase machine attribute -- the
  D-08 display-vs-machine split holds.

### Reviewer fixture anti-vacuous guard (T-12-03)

- `MIN_FINDINGS=5` declared at tests/D-reviewer-budget.sh:43.
- The guard `if [ "$matched_count" -lt "$MIN_FINDINGS" ]` (:214-219) sits BEFORE the
  per-section budget loop (`for body in "${FINDING_BODIES[@]}"` at :228) and exits 1 on a
  too-few-findings parse, so a zero-finding parse cannot reach the budget loop and emit
  spurious green PASS lines.
- The `--self-test` inversion (:194-204) exits non-zero when the guard fires on the
  zero-finding synthetic input. RED-on-old is documented and structurally guaranteed: the old
  shorthand sample (`<path>:<line>: crit: ...`, no leading `N.`, single `### Findings`) matches
  neither `SEV_HEADERS` (:152) nor `FINDING_RE` (:153), so it parses 0 findings and trips the
  guard.
- **Executed proof:** `bash tests/D-reviewer-budget.sh` -> `7 findings parsed`, 10/10 passed,
  exit 0 (GREEN-on-new). `--self-test` -> exit 1 (guard fires, fail-loudly).

### Security-reviewer agent + fixture (T-12-04, T-12-05, T-12-06, T-12-07)

- **T-12-04 ([Axx] preserved + asserted):** every worked-example finding line in
  security-reviewer.md carries `[Axx]` immediately after the location before the body (e.g.
  `1. src/handler.ts:42: [A04] ...` :127). The fixture's `FINDING_RE` (:143) ends in
  `\[[^]]+\] ` -- the trailing bracket assertion -- so a finding losing its tag fails to parse
  and the anti-vacuous guard catches the shortfall (the `[Axx]`-missing RED proof in the PLAN).
- **T-12-05 (CVE 75w carve-out):** `AUTO_CLARITY_CAP=75` (:46) and the carve-out detection
  `if [[ "$body" =~ \[(CVE|GHSA|CWE) ]]` (:220-222) escalate the per-entry cap. The worked CVE
  finding `[A06] [CVE-2025-1234] ...` is retained (security-reviewer.md :154,:164). The
  detection runs on the body AFTER the leading `[Axx]` strip (:169), so the second `[CVE-...]`
  bracket still fires the carve-out. **Executed proof:** the CVE finding measures `36 <= 75` --
  it would FAIL the 28w default cap, so the carve-out is load-bearing, not decorative.
- **T-12-06 (protected sections + lowercase severity=):** `## Class-2 Escalation Hook`,
  `## Hedge Marker Discipline`, and `## OWASP Top 10 Lens` each `git grep -c` = 1; `severity="`
  values lowercase only (:144,:178 = `important`; :327 = BNF `<critical|important|suggestion>`).
- **T-12-07 (security anti-vacuous guard):** `MIN_FINDINGS=5` (:44); guard at :202-207 BEFORE
  the per-finding budget loop (:217); `--self-test` exits 1 (:181-192). **Executed proof:**
  `bash tests/D-security-reviewer-budget.sh` -> `6 findings parsed`, 9/9 passed, exit 0;
  `--self-test` -> exit 1.

### Render-verbatim contract, both skills (T-12-08)

- review/SKILL.md:165 and security-review/SKILL.md:151 each name the four severity headers
  (`### Critical` / `### Important` / `### Suggestions` / `### Questions`, fixed order, always
  emitted) PLUS the trailing analytical section (`### Cross-Cutting Patterns` for review,
  `### Threat Patterns` for security-review) as "the skill's output shape" that "MUST reach the
  user intact". Render-verbatim is kept ABSOLUTE.
- The prohibition is INVERTED, not merely reworded: the Do-NOT list now forbids "Collapse,
  merge, reorder, or flatten the four severity sections" (review :178, security-review :164),
  explicitly because "reformatting would destroy the contracted shape, not impose it". The old
  prohibition is GONE: `git grep -nE "Reformat the (reviewer|security-reviewer).s response into
  severity groups" -- plugins/lz-advisor/skills/` returns NOTHING.
- `(none)` empty-section preservation is mandated in both skills' header-protection rules
  (review :179, security-review :165). The `**Verdict scope:**` markers survive in both
  (`git grep -c` = 1 each), confirming the inversion was a surgical edit of the expected header
  set, not a rewrite of the surrounding escalation flow.

### Cross-agent consistency surface (T-12-09, T-12-10)

- **T-12-09:** context-packaging.md `severity="` appears only as the lowercase BNF
  `severity="<critical|important|suggestion>"` (:378) and the lowercase worked example
  `severity="important"` (:402). A cross-check `git grep -n 'severity="' -- plugins/lz-advisor/
  agents/ plugins/lz-advisor/references/context-packaging.md | rg -v
  'critical|important|suggestion'` returns NOTHING -- no Title-Case value leaks anywhere across
  the cross-agent surface.
- **T-12-10:** the INPUT-side Verification template (the executor's prompt TO the agent) keeps
  its spelled-out `Severity (initial): [Critical/Important/Suggestion for review; ...]` LABELS
  unconverted at :290. It was NOT grouped into severity headers, so the consultation prompt does
  not diverge from the agent's expectation. No `crit:|imp:|sug:|q:` shorthand was introduced
  into context-packaging.md.

### Atomic completeness (T-12-11, T-12-12)

- **T-12-11:** `git grep -n '1\.0\.1' --` the five surfaces returns exactly 5 hits
  (plugin.json:3 + plan/execute/review/security-review SKILL.md `version:` fields); the same
  greps for `1\.0\.0` return NOTHING. No split version ships. README `### 1.0.1` (:79) is the
  separate changelog entry (not counted in the 5-surface tally, per the 16-phase convention).
- **T-12-12:** `git grep -nE 'crit:|imp:|sug:|q:' -- plugins/lz-advisor/` returns NOTHING; the
  same sweep for `formerly High|formerly Medium` returns NOTHING. The only `crit:` matches in
  the repo under `tests/` (D-reviewer-budget.sh:211, D-security-reviewer-budget.sh:199) are
  `#`-prefixed history comments naming the OLD grammar -- the documented/allowed exception (the
  live parsers use `SEV_HEADERS` / `FINDING_RE`, not the inline-severity alternation). No
  half-converted surface survives to produce mixed runtime output.

---

## Accepted risks log

These entries close the `accept`-disposition threats. Acceptance rationale carried from the
PLAN `<threat_model>` blocks (12-04-PLAN.md) and confirmed against the current repository state.

### AR-1 -- T-12-13: `.planning/` frozen history -- ACCEPTED

- **Category:** Tampering
- **Component:** `.planning/` frozen history (~362 artifacts containing the old shorthand
  grammar as accurate historical record).
- **Rationale:** Per the Phase 9 precedent, frozen history stays as accurate history. The
  Phase 12 cross-surface residue sweep is scoped to `plugins/lz-advisor/` ONLY and explicitly
  excludes `.planning/`. The old shorthand tokens that legitimately appear in archived plans /
  summaries are historical record, not live plugin surface, and rewriting them would falsify
  the record. Confirmed: `git status --porcelain .planning/` is clean -- no frozen-history
  artifact was modified by this phase (only this phase's own plan/summary files were authored).
- **Owner / review:** lz-advisor maintainer; re-review only if a future phase intentionally
  rewrites historical planning artifacts.

### AR-2 -- T-12-SC: supply-chain / package installs -- ACCEPTED

- **Category:** Tampering (supply chain)
- **Component:** npm / pip / cargo installs.
- **Rationale:** This phase performs NO package installs. It is a pure Markdown / YAML / bash
  edit (prompt-contract grammar rewrite + version bump + two bash budget fixtures consuming
  bundled coreutils only). No npm / PyPI / crates registry surface exists, so slopcheck /
  registry-legitimacy verification does not apply (RESEARCH: "installs zero packages").
- **Owner / review:** lz-advisor maintainer; re-review if any future phase adds a package
  manifest under the audited scope.

---

## Unregistered flags

None. None of the four execution records (`12-01-SUMMARY.md` through `12-04-SUMMARY.md`)
contains a `## Threat Flags` section (`git grep -n '## Threat Flags'` over all four returns
nothing), and no new attack surface was declared during implementation. There is nothing to map
to an unregistered flag. (Two SUMMARYs carry a `## Threat Model Compliance` narrative section,
which restates the registered threats and introduces no new surface.)

---

## Auditor notes

- Implementation files were treated as READ-ONLY and were not modified. Only this SECURITY.md
  was created.
- Verification was performed against the CURRENT committed state (working tree clean). Each
  `mitigate` threat was re-found by direct `git grep` / Read; SUMMARY and VERIFICATION claims
  were not accepted as evidence.
- Both budget fixtures were EXECUTED, not merely read: reviewer 7 findings / 10-of-10 assertions
  / exit 0; security 6 findings / 9-of-9 assertions / exit 0; both `--self-test` runs exit 1
  (fail-loudly guard fires). This confirms the Repudiation controls (T-12-03, T-12-07) and the
  provenance / carve-out controls (T-12-04, T-12-05) actually fire against the rewritten agents,
  closing the "looks like it validates" gap.
- The display-vs-machine severity split (D-08) is the load-bearing distinction across this
  phase: Title-Case `### Critical` etc. are DISPLAY headers (the new grouped grammar) while
  lowercase `severity="critical|important|suggestion"` is the MACHINE attribute the executor
  parses. T-12-02 / T-12-06 / T-12-09 each confirm the machine attribute stayed lowercase while
  the display surface moved to Title-Case headers; no Title-Case value leaked into any
  `severity="` attribute across agents + context-packaging.
- T-12-12's residue sweep correctly tolerates the two fixture history comments under `tests/`
  (the constraint's documented exception); a future move of either fixture INTO
  `plugins/lz-advisor/` would change that scope and SHOULD trigger a re-audit of the sweep
  boundary.
- Phase 13 (empirical verification) introduces live `claude -p` traces through the fixtures'
  `--from-trace` path; this audit covered only the static grammar + the self-extracted holistic
  example. The behavioral RED/GREEN proofs here are structural, not against live model output.
