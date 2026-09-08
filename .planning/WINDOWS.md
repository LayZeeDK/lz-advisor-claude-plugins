---
schema_version: 1
open_count: 7
waived_count: 0
fixed_count: 0
total_count: 7
last_updated: 2026-09-08T10:17:21.452Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 23 | deviation | eval/lz-eval-p23-citation-audit-q1-dryrun.md |  | Dry-run record + two new eval modules have had only executing-session content review; independent ENV-08 review still open (project review-before-publish MUST) | open |  | 2026-09-07T12:40:49.525Z |  |
| 2 | 23 | deviation | eval/lz-eval-p23-citation-audit-q2-record.md |  | The published ENV-04 q2 record has had only executing-session content review; the independent ENV-08 review of its five wording/labelling properties is still open (project review-before-publish MUST), closes in Plan 23-09 | open |  | 2026-09-08T09:36:20.647Z |  |
| 3 | 23 | deviation | eval/lz-eval-p23-env06-record.md |  | The published ENV-06 branch-(b) termination has had only executing-session content review; the independent ENV-08 review is still open (project review-before-publish MUST) and must check that the termination is never worded as MEASURED, that branch (b) is never presented as branch (c) or vice versa, and that no cost figure appears without its retry history and 79.32 upper bound; closes in Plan 23-09 | open |  | 2026-09-08T11:52:00.000Z |  |
| 4 | 23 | deviation | eval/lz-eval-p23-sliceA-read-record.md |  | The published ENV-03 Slice-A read record has had only executing-session content review; the independent ENV-08 review is still open (project review-before-publish MUST) and must check that no pooled rate, accuracy figure, interval or pass/fail verdict is implied and that the 2-versus-0 asymmetry is never presented as established | open |  | 2026-09-08T10:17:19.871Z |  |
| 5 | 23 | deviation | eval/lz-eval-p23-spike-record.md |  | The published ENV-05 spike record has had only executing-session content review; the independent ENV-08 review is still open and must check that the failure is worded as COMPLETENESS rather than ceiling exhaustion and that 55.30793200000004 never appears without its retry history and the 79.32313525000006 upper bound | open |  | 2026-09-08T10:17:20.386Z |  |
| 6 | 23 | deviation | .planning/phases/23-judge-free-confidence-and-operating-envelope-for-lz-deep-res/23-ENVELOPE.md |  | The published operating envelope has had only executing-session review; the maintainer read against the four prior-art skeletons (23-RESEARCH Pattern 6) that decides whether it is useful rather than boilerplate is OWED -- the structural section check does not cover it | open |  | 2026-09-08T10:17:20.915Z |  |
| 7 | 23 | deviation | eval/lz-eval-p23-citation-audit.mjs |  | ENV-08 ordering finding measured in Plan 23-09: the review record for lz-eval-p23-citation-audit.mjs and lz-eval-p23-resolvability.mjs (23-03-SUMMARY, commit 1bdb1ee) is NOT a git ancestor of their first-use commit 3189239, so it does not count as before-use under the ENV-08 boundary rule | open |  | 2026-09-08T10:17:21.452Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "23",
    "file": "eval/lz-eval-p23-citation-audit-q1-dryrun.md",
    "line": null,
    "description": "Dry-run record + two new eval modules have had only executing-session content review; independent ENV-08 review still open (project review-before-publish MUST)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-07T12:40:49.525Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "23",
    "file": "eval/lz-eval-p23-citation-audit-q2-record.md",
    "line": null,
    "description": "The published ENV-04 q2 record has had only executing-session content review; the independent ENV-08 review of its five wording/labelling properties is still open (project review-before-publish MUST), closes in Plan 23-09",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T09:36:20.647Z",
    "resolved_at": null
  },
  {
    "id": 3,
    "kind": "deviation",
    "phase": "23",
    "file": "eval/lz-eval-p23-env06-record.md",
    "line": null,
    "description": "The published ENV-06 branch-(b) termination has had only executing-session content review; the independent ENV-08 review is still open (project review-before-publish MUST) and must check that the termination is never worded as MEASURED, that branch (b) is never presented as branch (c) or vice versa, and that no cost figure appears without its retry history and 79.32 upper bound; closes in Plan 23-09",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T11:52:00.000Z",
    "resolved_at": null
  },
  {
    "id": 4,
    "kind": "deviation",
    "phase": "23",
    "file": "eval/lz-eval-p23-sliceA-read-record.md",
    "line": null,
    "description": "The published ENV-03 Slice-A read record has had only executing-session content review; the independent ENV-08 review is still open (project review-before-publish MUST) and must check that no pooled rate, accuracy figure, interval or pass/fail verdict is implied and that the 2-versus-0 asymmetry is never presented as established",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T10:17:19.871Z",
    "resolved_at": null
  },
  {
    "id": 5,
    "kind": "deviation",
    "phase": "23",
    "file": "eval/lz-eval-p23-spike-record.md",
    "line": null,
    "description": "The published ENV-05 spike record has had only executing-session content review; the independent ENV-08 review is still open and must check that the failure is worded as COMPLETENESS rather than ceiling exhaustion and that 55.30793200000004 never appears without its retry history and the 79.32313525000006 upper bound",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T10:17:20.386Z",
    "resolved_at": null
  },
  {
    "id": 6,
    "kind": "deviation",
    "phase": "23",
    "file": ".planning/phases/23-judge-free-confidence-and-operating-envelope-for-lz-deep-res/23-ENVELOPE.md",
    "line": null,
    "description": "The published operating envelope has had only executing-session review; the maintainer read against the four prior-art skeletons (23-RESEARCH Pattern 6) that decides whether it is useful rather than boilerplate is OWED -- the structural section check does not cover it",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T10:17:20.915Z",
    "resolved_at": null
  },
  {
    "id": 7,
    "kind": "deviation",
    "phase": "23",
    "file": "eval/lz-eval-p23-citation-audit.mjs",
    "line": null,
    "description": "ENV-08 ordering finding measured in Plan 23-09: the review record for lz-eval-p23-citation-audit.mjs and lz-eval-p23-resolvability.mjs (23-03-SUMMARY, commit 1bdb1ee) is NOT a git ancestor of their first-use commit 3189239, so it does not count as before-use under the ENV-08 boundary rule",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T10:17:21.452Z",
    "resolved_at": null
  }
]
````
