---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 0
total_count: 2
last_updated: 2026-09-08T09:36:20.647Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 23 | deviation | eval/lz-eval-p23-citation-audit-q1-dryrun.md |  | Dry-run record + two new eval modules have had only executing-session content review; independent ENV-08 review still open (project review-before-publish MUST) | open |  | 2026-09-07T12:40:49.525Z |  |
| 2 | 23 | deviation | eval/lz-eval-p23-citation-audit-q2-record.md |  | The published ENV-04 q2 record has had only executing-session content review; the independent ENV-08 review of its five wording/labelling properties is still open (project review-before-publish MUST), closes in Plan 23-09 | open |  | 2026-09-08T09:36:20.647Z |  |

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
  }
]
````
