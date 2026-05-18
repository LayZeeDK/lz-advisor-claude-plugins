---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
plan: 05
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/REQUIREMENTS.md
  - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md
  - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md
autonomous: true
requirements: [WR-04, WR-05]
requirements_addressed: [WR-04, WR-05]
target_version: 0.14.0
tags: [planning-trail-reconciliation, doc-only, no-plugin-changes]

must_haves:
  truths:
    - "REQUIREMENTS.md has no stale 'deferred' or 'P3 carry-forward' markers on WR-04 or WR-05 rows (those rows may or may not exist; if present, status updated to RESOLVED-PRE-PHASE-8)"
    - "07-VERIFICATION.md closure_amendment_2026_05_08_uat_replay_0_13_1 phase_8_worklist (lines 1333-1341) WR-04/05 item marked pre_closed_on_main_2026_05_05 (closed via commits 7f28903 + 5ea449f)"
    - "08-CONTEXT.md carry-forward note OR 08-05-SUMMARY.md explicitly records that WR-04/05 closure is reflected in planning trail"
    - "git grep -n 'WR-04\\|WR-05' .planning/ surfaces no remaining 'open' or 'deferred' markers (all hits are historical record only)"
    - "Plan ships zero plugin surface changes; only planning artifact edits"
  artifacts:
    - path: ".planning/REQUIREMENTS.md"
      provides: "REQUIREMENTS without stale WR-04/05 deferral markers (if such markers exist)"
      contains: "no occurrences of 'WR-04.*deferred' or 'WR-05.*deferred' patterns"
    - path: ".planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md"
      provides: "Phase 7 closure amendment with WR-04/05 reclassified pre_closed_on_main_2026_05_05"
      contains: "WR-04 / WR-05 pre-closed-on-main reference"
    - path: ".planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-05-SUMMARY.md"
      provides: "Plan 5 audit record documenting that WR-04/05 mechanical edits already landed in commits 7f28903 + 5ea449f"
      contains: "commit SHA references + git grep evidence of zero remaining lexicon hits"
  key_links:
    - from: "commits 7f28903 (WR-04) + 5ea449f (WR-05)"
      to: "main branch (closed on 2026-05-05)"
      via: "git log --format=oneline 7f28903 5ea449f"
      pattern: "WR-0[45].*closed"
---

<objective>
Repurposed plan per user decision 2026-05-18. Plan 5 was originally drafted as WR-04/05 mechanical edits to `references/context-packaging.md`, but research verified those edits already landed in commits `7f28903` (WR-04) + `5ea449f` (WR-05) on 2026-05-05 in the Phase 7 window. Running Plan 5 as drafted would produce an empty commit.

Per user decision: Plan 5 becomes a planning-trail reconciliation plan. It removes stale deferral markers from REQUIREMENTS.md, updates the Phase 7 VERIFICATION carry-forward, and produces a SUMMARY documenting the pre-closure. Preserves the 7-plan D-01 structure without manufacturing fake mechanical edits.

Purpose: Eliminate stale planning artifacts that suggest WR-04/05 are still open carry-forward items. Avoid Phase 9 confusion about which residuals remain.

Output: REQUIREMENTS.md / 07-VERIFICATION.md / 08-CONTEXT.md (or 08-05-SUMMARY.md) consistently reflect WR-04/05 as pre-closed on main 2026-05-05. Zero plugin surface changes.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md
@.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md
@.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md

<interfaces>
<!-- The closure context the executor needs -->

Pre-closure commits on main (verified via git log):
- `7f28903` -- WR-04 schema BNF severity allow-list (lines 376 of references/context-packaging.md updated to `severity="<critical|important|suggestion>"`)
- `5ea449f` -- WR-05 worked-example demo `Severity: High` -> `Severity: Important`

Current grep evidence of pre-closure:
```
git grep -nF "Severity: High" plugins/lz-advisor/      # returns 0 matches
git grep -nF "high|medium" plugins/lz-advisor/         # returns 0 matches
```

Stale artifact locations (planner discovers via git grep at exec time):
- `.planning/REQUIREMENTS.md`: search for any row tracking WR-04 or WR-05 (07-REVIEW review issues; may not exist as discrete rows in REQUIREMENTS.md vs. only in 07-REVIEW.md)
- `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` lines 1307-1312 (carry-forward Phase 8 residuals section); line 1310 `WR-04/05 schema parity wave (deferred from Plan 07-13 closure)`; lines 1333-1341 phase_8_worklist item 5 `WR-04/05 schema parity`
- `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md`: any mention of WR-04/05 as pending carry-forward
</interfaces>
</context>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| None | Doc-only reconciliation; no plugin surface modified |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-8-05-01 | N/A | planning trail | accept | No new attack surface -- planning-artifact text reconciliation. No code or data flow. |
</threat_model>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Discover all stale WR-04/05 references via git grep</name>
  <files>(read-only discovery; no file edits in this task)</files>
  <read_first>
    - .planning/REQUIREMENTS.md (full file)
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md (specifically lines 1300-1355 closure_amendment block)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (full file; planner searches for WR-04/05 mentions)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Summary section + Open Question 1 + Pitfall 5)
  </read_first>
  <action>
    Run `git grep -n "WR-04\|WR-05" .planning/` to enumerate every reference in the planning trail. Capture output to `/tmp/wr-04-05-references.txt` or print to stdout.

    For each hit, classify:
    - **HISTORICAL** -- references the closure event itself (commits 7f28903 / 5ea449f), audit logs, REVIEW.md issue rows that are already RESOLVED. Leave as-is.
    - **OPEN-DEFERRAL** -- text marking WR-04 or WR-05 as `deferred`, `P3 carry-forward`, `pending Phase 8`, `open carry-forward`, or similar. Mark for update in subsequent tasks.
    - **CONTEXT-CARRY-FORWARD** -- 08-CONTEXT.md text describing Plan 5 mechanical edits (the now-obsolete original Plan 5 scope per RESEARCH Summary item 1). Mark for update.

    Also verify pre-closure by running:
    `git log --format="%H %s %ai" 7f28903 5ea449f`
    `git grep -nF "Severity: High" plugins/lz-advisor/`
    `git grep -nF "high|medium" plugins/lz-advisor/`

    Record results in working notes; the next tasks will use the classification.
  </action>
  <verify>
    <automated>git grep -n "WR-04\|WR-05" .planning/ ; true</automated>
  </verify>
  <acceptance_criteria>
    - List of all WR-04/05 references in `.planning/` printed to stdout or captured to working notes
    - Each reference classified as HISTORICAL / OPEN-DEFERRAL / CONTEXT-CARRY-FORWARD
    - `git log` confirms commits 7f28903 + 5ea449f exist and date to 2026-05-05
    - `git grep -nF "Severity: High" plugins/lz-advisor/` returns 0 hits
    - `git grep -nF "high|medium" plugins/lz-advisor/` returns 0 hits
  </acceptance_criteria>
  <done>
    Discovery is complete; every WR-04/05 reference in the planning trail has a disposition (HISTORICAL stays; OPEN-DEFERRAL gets updated; CONTEXT-CARRY-FORWARD gets updated).
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Update 07-VERIFICATION.md closure_amendment_2026_05_08 phase_8_worklist + carry-forward section</name>
  <files>.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md</files>
  <read_first>
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md lines 1300-1355 (closure_amendment_2026_05_08_uat_replay_0_13_1 block, especially the `carry_forward_phase_8_residuals_from_prior_amendments` section at lines 1307-1312 and the `phase_8_worklist (revised 2026-05-08)` at lines 1333-1341)
    - Task 1 working notes (which lines classified as OPEN-DEFERRAL)
  </read_first>
  <action>
    Edit `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md`:

    1. Update line 1310 (the `WR-04/05 schema parity wave (deferred from Plan 07-13 closure):` bullet in the carry_forward section):

       Current:
       ```
       - **WR-04/05 schema parity wave** (deferred from Plan 07-13 closure): mechanical 1-line edits each; bundle with any Phase 8 schema-touching plan.
       ```

       New:
       ```
       - **WR-04/05 schema parity wave** (pre_closed_on_main_2026_05_05 via commits 7f28903 + 5ea449f; Phase 8 Plan 5 reconciliation confirmed zero remaining lexicon hits via `git grep -nF "Severity: High" plugins/lz-advisor/` and `git grep -nF "high|medium" plugins/lz-advisor/`).
       ```

    2. Update phase_8_worklist item 5 at line ~1339 (currently `WR-04/05 schema parity (P3 -- mechanical edits; bundle with any schema-touching plan)`):

       Current:
       ```
       5. **WR-04/05 schema parity** (P3 -- mechanical edits; bundle with any schema-touching plan).
       ```

       New:
       ```
       5. **WR-04/05 schema parity** (P3 -- PRE-CLOSED on main 2026-05-05 via commits 7f28903 + 5ea449f. Phase 8 Plan 5 reconciles planning trail. No further work required.).
       ```

    3. If any other WR-04/05 references identified in Task 1 are OPEN-DEFERRAL in this file, update them similarly with `pre_closed_on_main_2026_05_05` markers.

    Use Edit tool for each surgical change. Preserve every HISTORICAL reference (audit trail) untouched.
  </action>
  <verify>
    <automated>git grep -n "pre_closed_on_main_2026_05_05" .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md</automated>
  </verify>
  <acceptance_criteria>
    - 07-VERIFICATION.md carry_forward section line 1310 now records `pre_closed_on_main_2026_05_05` with commit SHA references
    - phase_8_worklist item 5 now records the same with explicit "PRE-CLOSED" status
    - `git grep -n "deferred from Plan 07-13" .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` returns no matches OR only matches in HISTORICAL context (e.g., quoted within audit log)
    - Every OPEN-DEFERRAL hit from Task 1 in this file is updated to the pre-closure marker
  </acceptance_criteria>
  <done>
    07-VERIFICATION.md closure amendment honestly reflects that WR-04/05 are pre-closed; no longer suggests open Phase 8 work for those items.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Update REQUIREMENTS.md (if applicable) + write 08-05-SUMMARY.md documenting Plan 5 reconciliation</name>
  <files>.planning/REQUIREMENTS.md (conditional), .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-05-SUMMARY.md (new)</files>
  <read_first>
    - .planning/REQUIREMENTS.md (full file; check for any WR-04/05 rows)
    - Task 1 working notes (REQUIREMENTS-related classifications)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (note: per user decision 2026-05-18, the carry-forward note in CONTEXT can be updated OR documented as-is via the SUMMARY -- choose one and stick with it)
  </read_first>
  <action>
    Part A: REQUIREMENTS.md (conditional)
    - If Task 1 discovered any WR-04 or WR-05 rows in REQUIREMENTS.md with `deferred` / `pending` markers, update each row to mark RESOLVED-PRE-PHASE-8 with commit SHA references (7f28903 / 5ea449f).
    - If NO such rows exist in REQUIREMENTS.md (which is expected per RESEARCH -- WR-04/05 are 07-REVIEW.md items, not REQUIREMENTS.md rows), skip Part A.
    - Adjust coverage block (lines 154-157) only if rows are added/removed; otherwise leave unchanged.

    Part B: Write `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-05-SUMMARY.md`

    Content:
    ```
    # Plan 08-05 SUMMARY: WR-04/05 reconciliation (trail cleanup)

    ## Status
    completed

    ## Original Scope
    Plan 5 was originally drafted in 08-CONTEXT.md D-01 as mechanical 1-line edits to `plugins/lz-advisor/references/context-packaging.md` lines 317 (WR-05: Severity: High -> Severity: Important) + 376 (WR-04: schema BNF |high|medium -> |important|suggestion).

    ## Discovery
    08-RESEARCH.md Pitfall 5 + Summary item 1 verified both edits already landed on main:
    - commit `7f28903` (2026-05-05): WR-04 schema BNF severity allow-list updated
    - commit `5ea449f` (2026-05-05): WR-05 worked-example severity vocabulary updated

    Empirical verification via git grep:
    - `git grep -nF "Severity: High" plugins/lz-advisor/` -> 0 matches
    - `git grep -nF "high|medium" plugins/lz-advisor/` -> 0 matches

    ## Repurposed Action
    Per user decision 2026-05-18, Plan 5 becomes a planning-trail reconciliation plan. Zero plugin surface changes. Updates:

    1. **07-VERIFICATION.md carry_forward section line 1310** -- updated to mark WR-04/05 pre_closed_on_main_2026_05_05 with commit SHA references.
    2. **07-VERIFICATION.md phase_8_worklist item 5** -- updated to PRE-CLOSED status; no further work required.
    3. **REQUIREMENTS.md** -- {conditional: if rows existed, updated to RESOLVED-PRE-PHASE-8; otherwise N/A per Task 1 discovery}
    4. **08-CONTEXT.md carry-forward note** -- {conditional: planner may leave 08-CONTEXT.md as a historical record of the original intent and document the repurpose in this SUMMARY; or update 08-CONTEXT.md inline}

    ## Plan 5 Preserves 7-Plan D-01 Structure
    Plan 5 is intentionally kept as plan slot 5 of the 7-plan Phase 8 structure (per D-01 locked decision). Removing it would force renumbering Plans 6, 7 and break cross-references in 08-CONTEXT.md / 08-VALIDATION.md.

    ## Files Modified
    - `.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-VERIFICATION.md` (2 surgical edits)
    - `.planning/REQUIREMENTS.md` ({modified | not modified per discovery})
    - `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-05-SUMMARY.md` (new file)

    ## Closure Evidence
    - `git grep -n "WR-04\|WR-05" .planning/` -- surviving hits are HISTORICAL only (audit trail / amendment record); no remaining `deferred` / `P3 carry-forward` / `open` markers.
    - Plugin surface unchanged; `git diff plugins/lz-advisor/` returns no output for this plan.
    ```

    Adjust placeholders ({conditional: ...}) based on Task 1 discovery results.

    Use Write tool for the new SUMMARY file.
  </action>
  <verify>
    <automated>test -f .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-05-SUMMARY.md && git grep -n "pre_closed_on_main_2026_05_05" .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-05-SUMMARY.md</automated>
  </verify>
  <acceptance_criteria>
    - 08-05-SUMMARY.md exists at the expected path
    - SUMMARY documents the discovery (commits + grep evidence), the repurpose (planning-trail reconciliation), and the exact files modified
    - `git diff plugins/lz-advisor/` returns no output for this plan (zero plugin surface changes)
    - `git grep -n "WR-04\|WR-05" .planning/` shows no remaining `deferred` / `open` / `P3 carry-forward` markers (only HISTORICAL records survive)
  </acceptance_criteria>
  <done>
    Planning trail consistently reflects WR-04/05 pre-closure; SUMMARY documents the discovery and repurpose; Plan 5 ships zero plugin changes by design.
  </done>
</task>

</tasks>

<verification>
After all 3 tasks:

1. `git grep -n "WR-04\|WR-05" .planning/` lists only HISTORICAL references (commits, amendment audit logs); no remaining `deferred`, `pending`, `P3 carry-forward`, `open` markers.
2. `git diff plugins/lz-advisor/` for Plan 5 returns empty (zero plugin surface changes).
3. `git grep -n "pre_closed_on_main_2026_05_05" .planning/` returns at least 2 hits (07-VERIFICATION.md amendment + 08-05-SUMMARY.md).
4. 08-05-SUMMARY.md documents the repurpose decision per user 2026-05-18.
</verification>

<success_criteria>
- Stale WR-04/05 deferral markers removed from planning trail
- 07-VERIFICATION.md closure_amendment honestly reflects pre-closure state
- 7-plan D-01 structure preserved (Plan 5 slot kept)
- No plugin surface modified
- Plan 5 audit record preserved via SUMMARY (downstream auditors won't wonder why Plan 5 has no plugin diff)
</success_criteria>

<output>
08-05-SUMMARY.md (written by Task 3) is the plan's output artifact. It explicitly documents:
- Original intent (mechanical edits to lines 317 + 376 of context-packaging.md)
- Discovery (pre-closure on commits 7f28903 + 5ea449f)
- Repurpose (planning-trail reconciliation)
- Files modified + closure evidence
- Why Plan 5 preserves slot 5 of 7 (D-01 structure)
</output>