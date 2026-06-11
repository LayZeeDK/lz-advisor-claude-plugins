# Quick Task 260611-ebt: Address the review findings (2nd /code-review pass)

Source: `/code-review medium` re-review of PR #1 after the 260611-c5l fixes. These 5 findings are mostly imperfections in those fixes. Verified by reading the actual lines.

## Hard constraints (apply to EVERY task)

1. **Both budget fixtures MUST stay GREEN after every change:** `bash tests/D-reviewer-budget.sh` -> 0; `bash tests/D-security-reviewer-budget.sh` -> 0; both `--self-test` -> 1. Re-run after every edit.
2. **The fixtures self-extract from the agent worked examples.** Finding #1 edits a line INSIDE the security-reviewer holistic blockquote -- keep the edited finding body <= 28w so the self-extract budget stays green; do not change any severity-header spelling.
3. **Preserve the render-verbatim contract** -- no change to `### Critical/Important/Suggestions/Questions` + `### Cross-Cutting Patterns`/`### Threat Patterns` spellings.
4. **No version bump.** Scope only to `plugins/lz-advisor/` and `tests/`. No `.planning/` edits. No AI attribution in commits. Use `git grep`/`rg`, never the grep tool.
5. **Respect locked decisions** (Phase 11 D-10 standalone fixtures; D-09 budgets). Do NOT dedup the fixtures.

## Findings

### FIX #1 -- security-reviewer.md:232 / :251 -- holistic Finding 3 self-contradicts (the prior #1 fix was incomplete)
Holistic Finding 3 sits under `### Important` (line 232) but still carries `Unresolved hedge: dev-only config (unverified). Verify dev-only before committing.`, and the note at :251 calls this the "post-verification (confirmed)" placement. A confirmed finding would NOT carry the `(unverified)`/`Verify before committing` frame -- this contradicts the Hedge Marker Discipline rule (:470: unconfirmed security-clearance hedge -> `### Suggestions` until confirmed).
**PREFERRED FIX (deeper, not another note):** make holistic Finding 3 genuinely CONFIRMED so its `### Important` placement is correct -- reword line 232 to drop the `Unresolved hedge: ... (unverified). Verify ... before committing.` frame and state a confirmed A05 finding (e.g. `3. src/api.ts:14: [A05] CORS reflects any Origin in the prod config. Restrict to an allowlist.`), keeping it <= 28w. Then update the :251 note so it accurately says finding 3 illustrates a CONFIRMED finding under `### Important`, while the standalone teaching example above shows the pre-verification unconfirmed hedge under `### Suggestions`.
- The `Unresolved hedge:` literal frame is still demonstrated in the standalone example (~:158) and the verify_request/Class-2 path in finding 5 (@compodoc), so removing it from holistic finding 3 loses no teaching coverage.
- Line 232 is inside the `> `-prefixed self-extract blockquote: keep the reworded body <= 28w; re-run the security fixture (must stay GREEN).
- Acceptable alternative if rewording is awkward: move holistic finding 3 to `### Suggestions` (and fix the note to call it pre-verification). Either way, the example, its placement, and the note MUST agree.

### FIX #2 -- tests/D-reviewer-budget.sh (~298-310) AND tests/D-security-reviewer-budget.sh (~324) -- PFV budget assertion has two gaps
The Per-finding-validation 60w loop word-counts ONLY the single `Validation of Finding N:` line. The contract (reviewer.md:281 / the agents' `<per_entry max_words=60>`) calls a PFV entry "one paragraph per finding" -- a multi-line paragraph under-counts and silently passes. Also: when the `### Per-finding validation` header is PRESENT but no line matches the `Validation of Finding ` prefix, zero entries are checked -> a vacuous pass (no loud-fail, unlike the other required sections' presence guards).
**FIX:** accumulate the entry's words across its paragraph -- from the `Validation of Finding N:` line up to (but not including) the next `Validation of Finding ` line, the next blank line, or the next `### ` boundary -- and assert that running total <= PFV_CAP (60). AND add a loud-fail (non-zero / `fail`) when the `### Per-finding validation` header is present but ZERO entries parsed (mirror the WR-01 anti-vacuous discipline). Apply to BOTH fixtures. Keep GREEN (the worked examples have no PFV section, so the present-branch is exercised via your own crafted check, not the default run -- ensure the default run still passes the "section absent -- skipped" branch).

### FIX #3 -- references/context-packaging.md:390 -- regression from the prior #11 fix
Line 390 now reads the `severity` attribute "matches ... Critical / Important / Suggestions". But the `severity` attribute value is a lowercase singular severity LEVEL (worked example :241 uses `severity="important"`), not the plural section-header name. The prior #11 fix over-corrected.
**FIX:** revert "Suggestions" -> "Suggestion" on line 390 (keep the de-duplication that #11 also did). Leave lines 290-291 as-is (they correctly use singular "Suggestion" for the same severity-level field).

### FIX #4 -- tests/D-reviewer-budget.sh (~297, 306, 312-314) -- dead variable (from the prior #2 fix)
`pfv_entry_failed` is set (297=0, 306=1) but its only consumer (`if [ "$pfv_entry_failed" -eq 0 ]; then : fi` at ~312-314) is a no-op; `FAIL_COUNT` (via `fail()`) already drives the exit code. The security fixture omits this variable.
**FIX:** delete `pfv_entry_failed` (lines 297, 306, and the no-op `if` at 312-314), keeping the inner `fail` call. The PFV loop then matches the security fixture's shape. (Fold this into the FIX #2 rewrite of the same loop.)

### FIX #5 -- tests/D-reviewer-budget.sh:~152/184 AND tests/D-security-reviewer-budget.sh:~142/153 -- SEV_HEADERS anchor (right-altitude fix)
The prior #4 fix dropped the trailing `$` from `SEV_HEADERS` to tolerate trailing space / CR. But CR is already normalized (from-trace does `tr -d '\r'`; self-extract reads the LF agent file), and the bare-prefix match now matches ANY heading starting with a severity word (e.g. `### Critical findings`), which would mis-set `current_sev` and count foreign numbered lines as findings (latent -- no contract header triggers it today).
**FIX:** restore a closed-vocabulary anchored match that still tolerates trailing whitespace: `SEV_HEADERS='^### (Critical|Important|Suggestions|Questions)[[:space:]]*$'` in BOTH fixtures. Update the adjacent comment to state the match is the 4 exact headers with optional trailing whitespace (closed vocabulary). Keep GREEN.

## Out of scope (minor, pre-existing -- do NOT fix in this task)
- `<max_count>15</max_count>` free-floating placement in the `<output_constraints>` of both agents: pre-existing from the v1.0.1 section restructure (NOT introduced by the fixes); the prose at reviewer.md:98 disambiguates it as aggregate. Leave it. Note in SUMMARY.md as a known minor item.
