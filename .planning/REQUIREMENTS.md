# Requirements: lz-advisor v1.0.1 "No review report shorthands"

**Defined:** 2026-06-07
**Core Value:** Near-Opus intelligence at Sonnet cost for coding tasks, achieved through strategic advisor consultation at high-leverage moments rather than running Opus end-to-end.

**Milestone goal:** Review and security-review reports present findings grouped under fully spelled-out severity headlines instead of the `crit:`/`imp:`/`sug:`/`q:` fragment-grammar shorthands, so reports are clear to the user -- without breaking the render-verbatim contract or the word-budget regression gates.

**Locked decisions (from milestone questioning + research):**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mechanism | Route A: agent-emit | Agents emit the grouped spelled-out shape directly; render-verbatim contract stays absolute. Token-impact ~0 (BPE: `Critical` and `crit` are each ~1 token; labels excluded from `wc -w` budget span). All 4 research dimensions converge here. |
| Layout | Section-per-severity | `### Critical` / `### Important` / `### Suggestions` / `### Questions` sections with explicit `(none)` markers and continuous finding numbers. User's original plan; token delta vs inline is noise (~10-25 tokens/report). |
| Security vocabulary | Unified set | Both skills use Critical/Important/Suggestion/Question -- the decided Phase 7 lexicon (Plan 07-09 renamed High->Important, Medium->Suggestion; WR-01..WR-05 spent 3 plans aligning 6 surfaces). Reverting would reintroduce paid-off drift. |
| Plugin version | 1.0.0 -> 1.0.1 | User directive: plugin version matches the milestone name (PATCH despite contract-shape change; supersedes the MINOR-for-contract-shape convention for this milestone). |

## v1.0.1 Requirements

### Report Format (RPT)

- [x] **RPT-01**: User sees review findings grouped under fully spelled-out severity headlines (`### Critical`, `### Important`, `### Suggestions`, `### Questions`) -- no `crit:`/`imp:`/`sug:`/`q:` shorthands anywhere in user-facing output
- [x] **RPT-02**: User sees security-review findings grouped under the same unified spelled-out headlines, with per-finding OWASP `[Axx]` tags preserved
- [x] **RPT-03**: Findings carry stable continuous numbers across severity sections, so `Per-finding validation` and `Cross-Cutting Patterns`/`Threat Patterns` ordinal references ("Findings 1, 2, 4") stay unambiguous
- [x] **RPT-04**: Empty severity sections render an explicit `(none)` marker

### Agent Contract (AGNT)

- [x] **AGNT-01**: Reviewer + security-reviewer Output Constraint grammar AND all worked examples rewritten to the grouped shape in one unit -- no legend/example disagreement; `(formerly High)`/`(formerly Medium)` residue annotations stripped (no third generation of "formerly X" residue)
- [x] **AGNT-02**: Word-budget sub-caps re-scoped coherently to the grouped section shape (aggregate budget intent unchanged)
- [x] **AGNT-03**: Existing validated behaviors survive the regrouping: Hedge Marker Discipline frames, Class-2 Escalation Hook, `<verify_request>` blocks (`severity=` attributes stay lowercase machine-lexicon)

### Skill Contract (SKILL)

- [x] **SKILL-01**: Both review skills' output-shape rules updated: render-verbatim preserved as absolute; the standing "Do NOT reformat into severity groups" clause (review/SKILL.md:178, security-review/SKILL.md:164) replaced by the new grouped headers as the literal headers that must reach the user intact

### Consistency (SYNC)

- [x] **SYNC-01**: `references/context-packaging.md` severity-vocab surfaces (Hedge Marker carve-out, severity schema) aligned with the grouped grammar; a per-surface disposition table covers every `git grep` hit (change vs keep-as-history; `.planning/` history artifacts stay untouched per Phase 9 precedent)
- [x] **SYNC-02**: Atomic 5-surface version bump 1.0.0 -> 1.0.1

### Gates (GATE)

- [x] **GATE-01**: Budget smoke fixtures (`D-reviewer-budget.sh`, `D-security-reviewer-budget.sh`) re-authored against the grouped grammar and committed as tracked tests with anti-vacuous-pass assertions (`matched_count >= min`) -- they currently exist nowhere in the repo (lived in cleared `.planning/phases/` workspaces)
- [ ] **GATE-02**: Headless `claude -p` UAT proves grouped spelled-out reports reach the rendered output on both review skills; the ngx-smart-components run uses a dedicated worktree branched from the `uat/pre-storybook-compodoc` checkpoint branch (exact name verified at plan time; that repo has active work in progress)

## Future Requirements

Deferred. Tracked but not in the current roadmap.

### Report Format

- **RPT-F01**: Per-severity roll-up count line ("Critical: 2, Important: 3, ...") -- cheap once grouping ships; section length already carries the signal
- **RPT-F02**: Severity/kind axis separation (Conventional-Comments model: reclassify `Question` as a kind, not a severity tier) -- re-architects the vocabulary, not just rendering
- **RPT-F03**: Stable severity-prefixed finding IDs (`CRIT-009`) for durable cross-referencing across persisted reports

## Out of Scope

| Feature | Reason |
|---------|--------|
| Skill-layer mechanical label expansion (Route B) | Erodes the render-verbatim contract ("no changes" becomes "one whitelisted change"); reopens the paraphrase-creep failure mode 16 phases of UAT eliminated; budget gates would test a non-user-facing surface |
| Reverting security-review to Critical/High/Medium | Phase 7 deliberately unified the lexicon; reverting reintroduces the cross-surface drift WR-01..WR-05 paid to eliminate |
| Numeric severity scores | Anchoring anti-pattern ("a number turns a highlighter into a judgment"); 4 named tiers are the industry norm |
| Emoji / icon severity markers | Violates the hard ASCII-only constraint; mojibake on Windows cp1252 |
| Expanding the severity vocabulary (Blocker/Major/Minor etc.) | Scope creep beyond "spell out the existing labels"; more tiers = worse scannability |
| Severity column table layout | Markdown tables wrap badly in terminals; complicates the fixture parser |
| Paraphrasing finding bodies during the format change | Directly violates render-verbatim; the fragment grammar's `<problem>. <fix>.` body stays byte-identical in spirit |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| RPT-01 | Phase 12 | Complete |
| RPT-02 | Phase 12 | Complete |
| RPT-03 | Phase 12 | Complete |
| RPT-04 | Phase 12 | Complete |
| AGNT-01 | Phase 12 | Complete |
| AGNT-02 | Phase 12 | Complete |
| AGNT-03 | Phase 12 | Complete |
| SKILL-01 | Phase 12 | Complete |
| SYNC-01 | Phase 12 | Complete |
| SYNC-02 | Phase 12 | Complete |
| GATE-01 | Phase 11 | Complete |
| GATE-02 | Phase 13 | Pending |

**Coverage:**
- v1.0.1 requirements: 12 total
- Mapped to phases: 12 (100%)
- Unmapped: 0

**Phase distribution:**
- Phase 11 (Fixture baseline): GATE-01 (1 requirement)
- Phase 12 (Atomic grouped-grammar rewrite): RPT-01, RPT-02, RPT-03, RPT-04, AGNT-01, AGNT-02, AGNT-03, SKILL-01, SYNC-01, SYNC-02 (10 requirements)
- Phase 13 (Empirical verification): GATE-02 (1 requirement)

---
*Requirements defined: 2026-06-07*
*Last updated: 2026-06-07 after roadmap creation (milestone v1.0.1) -- all 12 requirements mapped to Phases 11-13.*
