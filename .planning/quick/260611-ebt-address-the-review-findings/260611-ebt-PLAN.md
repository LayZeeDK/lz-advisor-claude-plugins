---
phase: quick-260611-ebt
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - plugins/lz-advisor/agents/security-reviewer.md
  - plugins/lz-advisor/references/context-packaging.md
  - tests/D-reviewer-budget.sh
  - tests/D-security-reviewer-budget.sh
autonomous: true
requirements: [FIX-1, FIX-2, FIX-3, FIX-4, FIX-5]

must_haves:
  truths:
    - "Both budget fixtures stay GREEN after every change: D-reviewer-budget.sh exits 0 (default) / 1 (--self-test); D-security-reviewer-budget.sh exits 0 (default) / 1 (--self-test)."
    - "The FIX #1 contradiction is RESOLVED: holistic Finding 3, its `### Important` placement, and the :251 note all agree on ONE lifecycle state (confirmed) -- no `Unresolved hedge:`/`(unverified)`/`Verify before committing` frame remains on Finding 3."
    - "The render-verbatim header set is UNCHANGED: `### Critical` / `### Important` / `### Suggestions` / `### Questions` + `### Threat Patterns` (security) / `### Cross-Cutting Patterns` (reviewer) spellings are byte-identical to before."
    - "Each budget fixture's PFV check accumulates a multi-line entry body (from a `Validation of Finding N:` line to the next such line / blank line / `### ` boundary) and asserts the running total <= 60w."
    - "Each budget fixture loud-fails (non-zero / fail()) when `### Per-finding validation` is PRESENT but ZERO entries parse (no vacuous pass)."
    - "The reviewer fixture's dead `pfv_entry_failed` variable and its no-op `if` are gone; the inner fail() call remains and the PFV loop matches the security fixture's shape."
    - "Both fixtures' SEV_HEADERS is a closed-vocabulary anchored match tolerating trailing whitespace: `^### (Critical|Important|Suggestions|Questions)[[:space:]]*$`."
    - "context-packaging.md:390 reads singular `Suggestion` (not plural `Suggestions`); lines 290-291 are unchanged singular `Suggestion`."
  artifacts:
    - path: "plugins/lz-advisor/agents/security-reviewer.md"
      provides: "Holistic Finding 3 reworded to a CONFIRMED A05 finding; :251 note aligned to confirmed/under-Important"
      absent: "Unresolved hedge: dev-only config (unverified)"  # this exact unconfirmed-hedge frame must NOT remain on holistic Finding 3 under ### Important
    - path: "tests/D-reviewer-budget.sh"
      provides: "Multi-line PFV accumulation + present-but-unparsed loud-fail + dead-var removal + closed-vocabulary SEV_HEADERS anchor"
    - path: "tests/D-security-reviewer-budget.sh"
      provides: "Multi-line PFV accumulation + present-but-unparsed loud-fail + closed-vocabulary SEV_HEADERS anchor"
    - path: "plugins/lz-advisor/references/context-packaging.md"
      provides: "Line 390 severity attribute value reverted to singular Suggestion"
  key_links:
    - from: "tests/D-reviewer-budget.sh"
      to: "plugins/lz-advisor/agents/reviewer.md"
      via: "self-extract holistic worked example -> parse -> budget-check"
      pattern: "self-extract"
    - from: "tests/D-security-reviewer-budget.sh"
      to: "plugins/lz-advisor/agents/security-reviewer.md"
      via: "self-extract holistic worked example (incl. reworded Finding 3) -> parse -> budget-check"
      pattern: "self-extract"
---

<objective>
Address the 5 findings from the 2nd `/code-review medium` pass on PR #1 (`260611-ebt-REVIEW.md`). These are imperfections in the prior 260611-c5l fixes: a self-contradicting holistic example, two PFV-assertion gaps, a dead variable, an over-tolerant severity anchor, and a plural/singular regression in a reference doc.

Purpose: leave the budget-fixture gates accurate (no vacuous passes, no latent foreign-header mis-counts), the security-reviewer holistic teaching example internally consistent (example + placement + note agree on ONE lifecycle state), and the context-packaging severity-attribute description correct (lowercase singular severity LEVEL, not the plural section-header name).

Output: edits to `plugins/lz-advisor/agents/security-reviewer.md`, both `tests/D-*-budget.sh` fixtures, and `plugins/lz-advisor/references/context-packaging.md`. No version bump. No `.planning/` edits. The `<max_count>15</max_count>` placement item is OUT OF SCOPE (pre-existing).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260611-ebt-address-the-review-findings/260611-ebt-REVIEW.md
@.planning/STATE.md
@./CLAUDE.md

# Files under edit (read in full before editing):
@plugins/lz-advisor/agents/security-reviewer.md
@plugins/lz-advisor/references/context-packaging.md
@tests/D-reviewer-budget.sh
@tests/D-security-reviewer-budget.sh

<constraints>
HARD CONSTRAINTS (from REVIEW.md "Hard constraints" -- apply to EVERY task):
- Both budget fixtures MUST stay GREEN after EVERY edit. Re-run all four invocations after each task:
  `bash tests/D-reviewer-budget.sh` -> 0 ; `bash tests/D-reviewer-budget.sh --self-test` -> 1 ;
  `bash tests/D-security-reviewer-budget.sh` -> 0 ; `bash tests/D-security-reviewer-budget.sh --self-test` -> 1.
- The security fixture SELF-EXTRACTS the holistic worked example from the agent file. Finding #1 edits a line INSIDE the `> `-prefixed self-extract blockquote: the reworded finding BODY (the `<threat>. <fix>.` span AFTER the `N. <file>:<line>: [<tag>] ` prefix) MUST stay <= 28w so the per-entry budget stays GREEN.
- Do NOT change any severity-header spelling. Preserve the render-verbatim contract: `### Critical` / `### Important` / `### Suggestions` / `### Questions` + `### Cross-Cutting Patterns` (reviewer) / `### Threat Patterns` (security).
- No version bump. Scope ONLY `plugins/lz-advisor/` and `tests/`. No `.planning/` edits.
- No AI attribution in commits. Use `git grep` / `rg`, NEVER the grep tool. NEVER `git add .`/`-A`/`-u` -- stage files by name.
- Respect locked decisions: Phase 11 D-10 standalone fixtures (do NOT dedup the two fixtures); D-09 budgets (28/22/75/60/160/30 caps + max_count 15 unchanged).
- Baseline (verified at plan time): all four invocations already 0/1/0/1. Keep them there.
</constraints>

<interfaces>
<!-- Key contracts the executor needs. Extracted from the files under edit. -->

security-reviewer.md current state (the contradiction):
- Line 232 (inside the `> ` holistic blockquote, under `### Important` at :229):
  `> 3. src/api.ts:14: [A05] CORS allows any origin in dev. Unresolved hedge: dev-only config (unverified). Verify dev-only before committing.`
  -- carries the `(unverified)` + `Verify ... before committing` frame, which is the UNCONFIRMED-hedge frame.
- Line 251 (prose "Word count breakdown:" paragraph) currently says Finding 3 "appears here under `### Important` to illustrate the post-verification (confirmed) placement, whereas the standalone teaching example above shows the same hedge under `### Suggestions` as the pre-verification (unconfirmed) placement".
- CONTRADICTION: an `### Important`/"confirmed" finding must NOT carry the `(unverified)`/`Verify before committing` frame (Hedge Marker Discipline rule at :470-472 files UNCONFIRMED security-clearance hedges under `### Suggestions`).
- The `Unresolved hedge:` literal frame is STILL demonstrated elsewhere -- the standalone teaching example near :156-158 and the verify_request/Class-2 path in Finding 5 (@compodoc, :240-241) -- so removing it from Finding 3 loses no teaching coverage.

security fixture FINDING_RE (the parse + body-strip contract; do NOT change it):
  `^[0-9]+\. `?[^[:space:]]+:[0-9]+(-[0-9]+)?: \[[^]]+\] `
  The counted body span is the `<threat>. <fix>.` text AFTER this prefix. The reworded Finding 3 body must be <= 28w.

Both fixtures, the current SEV_HEADERS (the OVER-TOLERANT anchor to fix in FIX #5):
  reviewer  :184  `SEV_HEADERS='^### (Critical|Important|Suggestions|Questions)'`
  security  :153  `SEV_HEADERS='^### (Critical|Important|Suggestions|Questions)'`
  Bare-prefix match -- matches ANY heading starting with a severity word (e.g. `### Critical findings`), mis-setting current_sev.

reviewer fixture PFV loop (FIX #2 + FIX #4 target), :295-317:
  - :297 `pfv_entry_failed=0` ; :306 `pfv_entry_failed=1` ; :312-314 the no-op `if [ "$pfv_entry_failed" -eq 0 ]; then : fi` -- DEAD (FIX #4).
  - :298-310 loop word-counts ONLY the single `Validation of Finding N:` line (single-line undercount -- FIX #2).
  - Present-but-zero-entries -> vacuous pass (no loud-fail -- FIX #2).

security fixture PFV loop (FIX #2 target), :322-338:
  - Same single-line undercount; same present-but-zero-entries vacuous pass. NO `pfv_entry_failed` var (already clean -- FIX #4 N/A here).

context-packaging.md (FIX #3):
  - :390 currently `Critical / Important / Suggestions` (plural -- regression). The `severity=` attribute value is a lowercase singular severity LEVEL (worked example :241 / schema :397 use `severity="important"`), so the prose enumerating its allowed values should read singular `Suggestion`.
  - :290-291 already correct singular `Suggestion` -- LEAVE AS-IS.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: FIX #1 -- make security-reviewer holistic Finding 3 genuinely CONFIRMED and align the :251 note</name>
  <files>plugins/lz-advisor/agents/security-reviewer.md</files>
  <action>
Resolve the holistic Finding 3 self-contradiction with the PREFERRED DEEPER fix (NOT another reconciliation note -- the prior pass already tried a note and it was insufficient). Make Finding 3 a genuinely CONFIRMED A05 finding so its `### Important` placement is correct, then align the :251 prose note to say it illustrates a confirmed finding.

Edit 1 -- rewrite the blockquoted Finding 3 line under `### Important` (currently line 232):
  Replace
    `> 3. src/api.ts:14: [A05] CORS allows any origin in dev. Unresolved hedge: dev-only config (unverified). Verify dev-only before committing.`
  with a CONFIRMED A05 finding that drops the `Unresolved hedge: ... (unverified). Verify ... before committing.` frame entirely, e.g.
    `> 3. src/api.ts:14: [A05] CORS reflects any Origin in the prod config. Restrict to an allowlist.`
  CONSTRAINTS on the replacement:
    - Keep the `> ` blockquote prefix (the line stays inside the self-extract blockquote).
    - Keep the exact prefix shape `N. <file>:<line>: [<OWASP-tag>] ` so FINDING_RE still parses it (a continuous-number `3.`, a `path:line`, then an `[A05]` bracket).
    - The BODY span (the `<threat>. <fix>.` text after `3. src/api.ts:14: [A05] `) MUST be <= 28 words. The suggested body above is 12 words.
    - Do NOT introduce any of the Hedge-Marker sentinel tokens (`unverified`, `Verify ... before committing`, `Unresolved hedge:`, `Assuming ... (unverified)`) -- a confirmed finding carries none of them.
    - State a confirmed PROD-config misconfiguration (not dev-only) so "confirmed under `### Important`" is internally true.

Edit 2 -- align the :251 note (the "Word count breakdown:" paragraph, the sentence beginning "Finding 3 (the CORS dev-config hedge) appears here under `### Important`..."):
  Reword that sentence so it accurately says Finding 3 illustrates a CONFIRMED finding placed under `### Important`, while the standalone teaching example above (near :156-158) shows the pre-verification UNCONFIRMED hedge under `### Suggestions`. Drop the now-false "post-verification (confirmed) placement ... the same hedge" framing -- Finding 3 no longer carries the hedge frame. The example, its `### Important` placement, and this note MUST all agree on ONE lifecycle state (confirmed).
  Keep the parenthetical descriptor consistent with the new finding (it is no longer "the CORS dev-config hedge"; describe it as the confirmed CORS prod-config misconfiguration or similar).

DO NOT touch the standalone teaching example near :156-158 (it MUST keep the `Unresolved hedge: ... (unverified). Verify ... before committing.` frame under `### Suggestions` -- that is the surviving pre-verification teaching coverage). DO NOT touch Finding 5 / the @compodoc verify_request path (:240-241). DO NOT change any `### ` header spelling. DO NOT alter the per-section budget XML or any cap.
  </action>
  <verify>
    <automated>cd "D:/projects/github/LayZeeDK/lz-advisor-claude-plugins" && bash tests/D-reviewer-budget.sh >/dev/null 2>&1; echo "rev default=$?"; bash tests/D-reviewer-budget.sh --self-test >/dev/null 2>&1; echo "rev self-test=$?"; bash tests/D-security-reviewer-budget.sh >/dev/null 2>&1; echo "sec default=$?"; bash tests/D-security-reviewer-budget.sh --self-test >/dev/null 2>&1; echo "sec self-test=$?"</automated>
    Also assert (a) `git grep -c "Unresolved hedge:" plugins/lz-advisor/agents/security-reviewer.md` is UNCHANGED minus exactly the count removed from Finding 3 (the standalone example + the Hedge-Discipline prose definitions remain); (b) the reworded Finding 3 body word count is <= 28 via `printf '%s' '<body>' | wc -w`; (c) `git grep -n "post-verification (confirmed) placement" plugins/lz-advisor/agents/security-reviewer.md` returns NOTHING (the false framing is gone).
  </verify>
  <done>
Holistic Finding 3 under `### Important` is a confirmed A05 finding with NO hedge/`(unverified)`/`Verify before committing` frame and a body <= 28w; the :251 note describes it as a confirmed-under-`### Important` illustration (standalone example below stays the unconfirmed-under-`### Suggestions` teaching case); example + placement + note all agree on ONE lifecycle state. All four fixture invocations are 0/1/0/1. No header spelling changed; no version bump.
  </done>
</task>

<task type="auto">
  <name>Task 2: FIX #2 + FIX #4 + FIX #5 -- repair the PFV assertion, drop the dead var, and re-anchor SEV_HEADERS in BOTH fixtures</name>
  <files>tests/D-reviewer-budget.sh, tests/D-security-reviewer-budget.sh</files>
  <action>
Apply three fixes to both budget fixtures. Keep the two fixtures STANDALONE (D-10 -- no shared helper, no dedup); only the parser SHAPE is aligned. Do NOT change any cap constant (28/22/75/60/160/30/15) or any `### ` header spelling.

FIX #2 (PFV multi-line accumulation + present-but-unparsed loud-fail) -- BOTH fixtures, in the `### Per-finding validation` present-branch (reviewer ~:295-317, security ~:322-338):
  The contract (`<per_entry max_words=60>`, "one paragraph per finding") makes a PFV entry a multi-line PARAGRAPH, not a single line. Rewrite the present-branch to accumulate each entry's words across its paragraph:
    - An ENTRY begins at a line matching the `Validation of Finding N:` prefix (the existing `case "$pfv_line" in "Validation of Finding "*)` shape).
    - The entry's body runs FROM that `Validation of Finding N:` line UP TO (but NOT including) the next boundary, where a boundary is ANY of: (1) the next `Validation of Finding ` line, (2) the next blank line, or (3) the next `### ` heading line.
    - Accumulate `wc -w` across all lines in the entry's span (the opening `Validation of Finding N:` line PLUS its continuation lines), and assert the running TOTAL <= PFV_CAP (60). On overflow, call `fail` with the accumulated word count and the entry's first line.
    - Implementation note: PFV_BODY already comes from `extract_section '^### Per-finding validation'` (bounded at the next `### ` heading). Iterate its lines; when you hit a `Validation of Finding ` line, finalize the previous entry (if any) and start a new accumulator; when you hit a blank line, finalize the current entry (a blank line ends the paragraph); a subsequent `### ` boundary cannot appear inside PFV_BODY because extract_section already stopped there, but treat any `### ` line as a finalize boundary too for robustness. Finalize the last open entry after the loop ends (EOF of PFV_BODY).
  ADD a present-but-zero-entries loud-fail (mirror the WR-01 anti-vacuous discipline already used for the required sections): track a counter of PFV entries actually parsed; if the `### Per-finding validation` header was PRESENT but ZERO entries matched the `Validation of Finding ` prefix, call `fail` (non-zero exit) instead of falling through to a silent/vacuous pass. The absent-branch ("optional section absent -- skipped") is UNCHANGED.

FIX #4 (delete the dead variable) -- REVIEWER fixture ONLY (~:297, :306, :312-314):
  Remove `pfv_entry_failed=0` (:297), `pfv_entry_failed=1` (:306), and the no-op `if [ "$pfv_entry_failed" -eq 0 ]; then : fi` block (:312-314). Keep the inner `fail` call (which already drives FAIL_COUNT / the exit code via fail()). After this, the reviewer PFV loop SHAPE matches the security fixture's PFV loop (which never had this variable). Fold this deletion INTO the FIX #2 rewrite of the same loop -- do not leave a half-rewritten loop.

FIX #5 (restore closed-vocabulary SEV_HEADERS anchor with trailing-whitespace tolerance) -- BOTH fixtures (reviewer :184, security :153):
  Replace
    `SEV_HEADERS='^### (Critical|Important|Suggestions|Questions)'`
  with
    `SEV_HEADERS='^### (Critical|Important|Suggestions|Questions)[[:space:]]*$'`
  This keeps the 4 EXACT headers (closed vocabulary) while tolerating trailing space / CR -- CR is already normalized upstream (`tr -d '\r'` in from-trace; self-extract reads the LF agent file), but the `[[:space:]]*$` keeps the trailing-whitespace tolerance the prior #4 fix intended WITHOUT the over-broad bare-prefix match (which matched `### Critical findings` and would mis-set current_sev and count foreign numbered lines). Update the adjacent comment block (reviewer ~:178-183, security ~:147-152) to state the match is the 4 exact headers with OPTIONAL TRAILING WHITESPACE (closed vocabulary), removing the "longer accidental prefix match is harmless" rationale (the anchor now PREVENTS that match).

CRITICAL on the present-branch GREEN constraint: the holistic worked examples have NO `### Per-finding validation` section, so the DEFAULT run exercises the ABSENT branch ("section absent -- skipped") -- which MUST still pass. Verify the present-branch logic by reasoning / a crafted local check, NOT by adding a PFV section to the agent worked examples (that would change the self-extract budget and is out of scope). Do NOT add any PFV section to either agent file.
  </action>
  <verify>
    <automated>cd "D:/projects/github/LayZeeDK/lz-advisor-claude-plugins" && bash tests/D-reviewer-budget.sh >/dev/null 2>&1; echo "rev default=$?"; bash tests/D-reviewer-budget.sh --self-test >/dev/null 2>&1; echo "rev self-test=$?"; bash tests/D-security-reviewer-budget.sh >/dev/null 2>&1; echo "sec default=$?"; bash tests/D-security-reviewer-budget.sh --self-test >/dev/null 2>&1; echo "sec self-test=$?"</automated>
    Assert the four lines print 0 / 1 / 0 / 1. THEN prove the new PFV logic with two crafted `--from-trace` inputs per fixture (write temp trace files via the Write tool, never heredoc): (1) a valid >=5-finding report WITH a `### Per-finding validation` section containing ONE multi-line entry that totals > 60w across its lines -> the run must `fail`/exit non-zero (proves multi-line accumulation catches an overflow a single-line count would miss); (2) the same valid report WITH a `### Per-finding validation` header but ZERO `Validation of Finding ` lines -> the run must `fail`/exit non-zero (proves the present-but-unparsed loud-fail). Also assert `git grep -c "pfv_entry_failed" tests/D-reviewer-budget.sh` == 0 (dead var gone) and `git grep -n "Suggestions|Questions)\[\[:space:\]\]\*\$" tests/D-reviewer-budget.sh tests/D-security-reviewer-budget.sh` matches in BOTH fixtures (closed-vocabulary anchor restored). Delete the temp trace files after verifying.
  </automated>
  <done>
Both fixtures accumulate PFV entry words across the paragraph (from `Validation of Finding N:` to the next such line / blank line / `### ` boundary) and assert the total <= 60; both loud-fail when `### Per-finding validation` is present with zero parsed entries; the reviewer fixture's `pfv_entry_failed` dead var + no-op `if` are gone (loop shape now matches security); both fixtures use `^### (Critical|Important|Suggestions|Questions)[[:space:]]*$` with an updated closed-vocabulary comment. Default runs still hit the "section absent -- skipped" branch and pass. All four invocations are 0/1/0/1; crafted from-trace overflow + present-but-unparsed inputs both exit non-zero. No cap constant or header spelling changed.
  </done>
</task>

<task type="auto">
  <name>Task 3: FIX #3 -- revert the plural Suggestions regression in context-packaging.md:390</name>
  <files>plugins/lz-advisor/references/context-packaging.md</files>
  <action>
On line 390 (the `**`severity`** (OPTIONAL):` bullet describing the `severity=` verify_request attribute value), revert the plural `Suggestions` back to singular `Suggestion`. The current text reads `... severity (Critical / Important / Suggestions -- the same vocabulary ...)`; change it to `... severity (Critical / Important / Suggestion -- the same vocabulary ...)`. Rationale: the `severity=` attribute carries a lowercase singular severity LEVEL (worked example :241 and schema :397 use `severity="important"`), NOT the plural section-header name; the prior #11 fix over-corrected to the plural section-header spelling. Keep any de-duplication the prior #11 fix also did intact (do not re-introduce a duplicate line). LEAVE lines 290-291 exactly as-is -- they already correctly use singular `Suggestion` for the same severity-LEVEL field. Change ONLY the single token `Suggestions` -> `Suggestion` on line 390; touch nothing else in the file.
  </action>
  <verify>
    <automated>cd "D:/projects/github/LayZeeDK/lz-advisor-claude-plugins" && git grep -n "Suggestion" -- plugins/lz-advisor/references/context-packaging.md</automated>
    Assert line 390 now reads `Critical / Important / Suggestion --` (singular) and lines 290-291 still read singular `Suggestion`; assert NO `Critical / Important / Suggestions --` (plural in the severity-attribute enumeration) remains. Re-run all four fixture invocations and confirm 0/1/0/1 (this file is not self-extracted, so it must not affect the gates -- a regression here would mean an unintended edit).
  </automated>
  <done>
context-packaging.md:390 reads singular `Suggestion` in the `severity=` attribute value enumeration; lines 290-291 unchanged singular `Suggestion`; no plural `Suggestions` remains in the severity-attribute prose; the prior #11 de-duplication is preserved. All four fixture invocations remain 0/1/0/1.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| live agent emission -> budget fixture (`--from-trace`) | Untrusted LLM response text is parsed by the fixtures; a parser gap (vacuous pass, foreign-header mis-count) lets an over-budget or malformed report slip the gate. This task hardens that boundary (FIX #2, FIX #5). |
| agent worked example -> self-extract budget gate | The fixtures self-extract the holistic example; an internally-contradictory example (FIX #1) teaches the model the wrong lifecycle-state placement and weakens the live contract. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-ebt-01 | Tampering | PFV budget assertion (both fixtures) | mitigate | FIX #2 multi-line accumulation closes the under-count gap that let a >60w multi-line PFV entry pass; present-but-unparsed loud-fail closes the vacuous-pass gap. Proven by crafted from-trace inputs. |
| T-ebt-02 | Spoofing | SEV_HEADERS match (both fixtures) | mitigate | FIX #5 closed-vocabulary anchor (`[[:space:]]*$`) prevents a foreign heading (`### Critical findings`) from spoofing a severity section and mis-counting foreign numbered lines as findings. |
| T-ebt-03 | Repudiation | holistic teaching example (security-reviewer.md) | mitigate | FIX #1 removes the example/placement/note contradiction so the self-extracted gate and the model's few-shot signal agree on the confirmed-under-Important lifecycle state. |
| T-ebt-SC | Tampering | npm/pip/cargo installs | accept | No package-manager installs in this task; scope is doc + bash-fixture edits only. No supply-chain surface introduced. |
</threat_model>

<verification>
After EACH task and once at the end, run all four budget-fixture invocations and confirm exit codes 0 / 1 / 0 / 1:

```
bash tests/D-reviewer-budget.sh ; echo $?              # expect 0
bash tests/D-reviewer-budget.sh --self-test ; echo $?  # expect 1
bash tests/D-security-reviewer-budget.sh ; echo $?     # expect 0
bash tests/D-security-reviewer-budget.sh --self-test ; echo $?  # expect 1
```

Residue / scope checks (use `git grep`, never the grep tool):
- `git grep -n "post-verification (confirmed) placement" plugins/lz-advisor/agents/security-reviewer.md` -> NOTHING (FIX #1 false framing gone).
- The reworded Finding 3 body (the span after `3. src/api.ts:14: [A05] `) is <= 28w.
- `git grep -c "pfv_entry_failed" tests/D-reviewer-budget.sh` -> 0 (FIX #4 dead var gone).
- Both fixtures contain `^### (Critical|Important|Suggestions|Questions)[[:space:]]*$` (FIX #5).
- `git grep -n "Critical / Important / Suggestion " plugins/lz-advisor/references/context-packaging.md` shows :390 singular; no plural `Suggestions --` remains in the severity-attribute prose (FIX #3).
- No edits outside `plugins/lz-advisor/` and `tests/`: `git status --porcelain` shows ONLY the four files in `files_modified` (plus this `.planning/` plan, which is the planning artifact -- not a code edit and not committed with the fix).
- No version-string change: `git grep -n '"version"' plugins/lz-advisor/.claude-plugin/plugin.json` and the four SKILL.md `version:` fields are unchanged.

Crafted `--from-trace` proof (FIX #2, both fixtures): write a temp valid report with (1) a multi-line PFV entry totalling > 60w and (2) a PFV header with zero `Validation of Finding ` lines; assert both exit non-zero. Delete temp files after.
</verification>

<success_criteria>
- All four budget-fixture invocations: 0 (reviewer default) / 1 (reviewer self-test) / 0 (security default) / 1 (security self-test).
- FIX #1: security-reviewer holistic Finding 3 is a confirmed A05 finding (no hedge/`(unverified)`/`Verify before committing` frame, body <= 28w) under `### Important`; the :251 note describes it as confirmed-under-Important; the standalone teaching example still demonstrates the unconfirmed-under-Suggestions hedge; example + placement + note agree on ONE lifecycle state.
- FIX #2: both fixtures accumulate multi-line PFV entry bodies (`Validation of Finding N:` -> next such line / blank line / `### ` boundary) against the 60w cap, and loud-fail on present-but-zero-entries; default runs still pass via the absent branch.
- FIX #4: reviewer fixture `pfv_entry_failed` + no-op `if` removed; loop shape matches the security fixture.
- FIX #5: both fixtures use the closed-vocabulary `^### (Critical|Important|Suggestions|Questions)[[:space:]]*$` anchor with an updated comment.
- FIX #3: context-packaging.md:390 reverted to singular `Suggestion`; lines 290-291 unchanged; #11 de-dup preserved.
- Render-verbatim header set unchanged; no version bump; edits confined to `plugins/lz-advisor/` + `tests/`; `<max_count>15</max_count>` placement NOT touched (out of scope -- note as a known minor item in SUMMARY.md).
</success_criteria>

<output>
Create `.planning/quick/260611-ebt-address-the-review-findings/260611-ebt-SUMMARY.md` when done. Note the out-of-scope `<max_count>15</max_count>` free-floating placement as a known minor item (pre-existing from the v1.0.1 section restructure; disambiguated as aggregate by reviewer.md:98 prose; deliberately NOT fixed here).
</output>
