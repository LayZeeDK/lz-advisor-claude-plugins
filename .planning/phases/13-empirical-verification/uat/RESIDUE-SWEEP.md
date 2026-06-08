# Phase 13 Plan 03 -- Residue Sweep (SC-5) + Worktree Teardown (D-08)

GATE-02 closeout evidence: the scoped severity-shorthand residue sweep over
`plugins/lz-advisor/` (SC-5), the companion `formerly-X` sweep, the structural
proof that no frozen `.planning/` history is touched, and the throwaway ngx
worktree teardown confirmation (D-08).

**Run:** 2026-06-08 (Plan 13-03), from THIS repo root
(`D:/projects/github/LayZeeDK/lz-advisor-claude-plugins`), branch
`feat/v1_0_1-no-review-shorthands`.

## SC-5 residue sweep (D-09)

All sweeps run with the `-- plugins/lz-advisor/` pathspec, which ALONE excludes
every frozen `.planning/` history artifact (no `:(exclude)` list; Phase 9
leave-history-as-history precedent).

| # | Invocation | Expected | Observed output | Exit | Verdict |
|---|------------|----------|-----------------|------|---------|
| 1 | `git grep -nE 'crit:\|imp:\|sug:\|q:' -- plugins/lz-advisor/` | no output, exit 1 | (none) | 1 | PASS -- zero shorthand residue |
| 1b | `git grep -nE '\b(crit\|imp\|sug\|q):' -- plugins/lz-advisor/` | no output, exit 1 | (none) | 1 | PASS -- word-boundary anchored, zero severity-shorthand |
| 2 | `git grep -nE 'formerly High\|formerly Medium' -- plugins/lz-advisor/` | no output, exit 1 | (none) | 1 | PASS -- zero formerly-X residue |

Sweep 1 (the literal D-09 invocation) and sweep 1b (the word-boundary-anchored
form that is robust against `q:`-in-prose false positives) BOTH exit 1 with no
output. The unanchored sweep 1 is ALSO clean here -- there is no `q:`
prose false positive in `plugins/lz-advisor/`, because the seeded `req: RawRequest`
TypeScript identifier that produced the documented false positive in Plan 13-02's
grade lives in the ngx WORKTREE (`review-src/handler.ts`), NOT in the plugin tree.
No `q:` disposition is required for SC-5.

## `q:` false-positive disposition (D-09 / RESEARCH Q4)

- **Risk acknowledged:** `q:` is the only severity-shorthand token that can match
  ordinary prose (e.g. `FAQ:`, `Q:`, or a TypeScript `req:` identifier).
- **Result in `plugins/lz-advisor/`:** zero hits on BOTH the unanchored and the
  word-boundary-anchored form. No `q:` substring (innocuous prose OR real
  shorthand) exists in the scoped tree.
- **Disposition:** NONE NEEDED -- there is nothing to disposition. (Contrast Plan
  13-02, where the unanchored grep fired on `req:` inside the captured ngx
  `report.md` and was dispositioned as innocuous prose via the anchored form. That
  surface is the ngx worktree, not the plugin tree under SC-5's scope.)

## Frozen `.planning/` history is structurally untouched (T-13-05 mitigation)

Proof that the pathspec scoping is the structural guard, not a coincidence:

```
$ git grep -lE 'crit:|imp:|sug:|q:'                    # repo-wide, NO pathspec
.planning/PROJECT.md
.planning/REQUIREMENTS.md
.planning/ROADMAP.md
.planning/STATE.md
.planning/phases/11-fixture-baseline/11-01-PLAN.md
... (41 files total, EVERY ONE under .planning/) ...

$ git grep -lE '\b(crit|imp|sug|q):' | wc -l           # repo-wide
41
```

The same pattern matches 41 tracked files repo-wide -- ALL under `.planning/`
(frozen v1.0 + v1.0.1 planning history that documents the old shorthand as
accurate history). ZERO of them are under `plugins/lz-advisor/`. The
`-- plugins/lz-advisor/` pathspec excludes all 41 structurally; no `.planning/`
history file is referenced or modified by the SC-5 sweep. This is the Phase 9
precedent: historical shorthand references stay as accurate history.

## SC-5 verdict

**PASS.** Zero `crit:|imp:|sug:|q:` and zero `formerly-X` residue in
`plugins/lz-advisor/` (exit 1 on all sweeps); frozen `.planning/` history
untouched (pathspec scoping verified structurally). No mechanical residue to fix
in-phase (D-10); no `q:` false positive to disposition.

## Worktree teardown (D-08) -- see TEARDOWN section below

The throwaway ngx worktree teardown is recorded in the `## Teardown (D-08)`
section appended after the evidence-custody precondition gate was confirmed.
