---
phase: 07
plan: 08
type: replay-results
dated: 2026-05-01
parent_research: 07-RESEARCH-GAP-2-wip-discipline.md
fixture: .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh
---

# Plan 07-08 Empirical Replay Results -- Gap 2 wip-discipline closure validation

## Goal

Prove that (a) the synthesized in-process path-d scenario fires path-d (exit 2) within the smoke run, structurally validating the gap-2 assertion's correctness without cross-repo SHA dependency; AND (b) the --replay flag's error-path is wired correctly (exit 65 + clear error message) when invoked against SHAs that do not exist in the current working-tree repo.

The empirical session 2 / 5 commits (8c25c9e, 06af4cf, 15d8fac) live in the external ngx-smart-components testbed repo, NOT in this plugin repo. The --replay flag is intended for manual-auditor use against that testbed; phase-closure does not depend on cross-repo replay.

## Structural validation results

### Step 1: Synthesized in-process path-d scenario (default smoke run)

Command: `bash E-verify-before-commit.sh`

Path-d outcome: SUCCESS; exit code 2

Output:
```
--- Synthesizing in-process path-d scenario (set SYNTHESIZE_PATH_D=0 to skip) ---
  Synthesized subject: fix(synthesized): non-wip subject with Outstanding Verification (path-d test)
  WIP_PRESENT: 0 (expected 0)
  OUTSTANDING_PRESENT: 1 (expected 1)
[OK] Path (b) verify-trailer: commit body has 1 Verified: trailer(s) AND 12 Bash tool_use event(s)
[ERROR] Path (d) wip-discipline violation: subject does not match '^wip(\(.+\))?:|^chore\(wip\):' BUT body contains '## Outstanding Verification' AND 1 file(s) changed (outside trailer-only carve-out)
  Subject: fix(synthesized): non-wip subject with Outstanding Verification (path-d test)
  Source: synthesized in-process path-d scenario (Plan 07-08 Gap 2 structural proof) -- this is the EXPECTED firing under the synthesized scenario.
  Per <verify_before_commit> Phase 3.5 Subject-prefix discipline: subject MUST use 'wip:' prefix when Outstanding Verification is populated, UNLESS the commit ONLY records additional Verified: trailers for already-listed Outstanding items (zero file changes).
[SUCCESS] E-verify-before-commit.sh: synthesized path-d scenario fired (exit 2 expected); Gap 2 closure structurally proven
  Path (a) hedge-flag: PATH_A=0
  Path (b) verify-trailer: PATH_B=1
  Path (c) wip-commit: PATH_C=0
  Path (d) violation (synthesized): PATH_D_VIOLATION=1 (EXPECTED FIRING)
```

Verdict: PASS. Expected exit 2 (synthesized path-d scenario fires; Gap 2 closure structurally proven); observed: 2.

### Step 2: --replay against 8c25c9e (structural error-path validation)

Command: `bash E-verify-before-commit.sh --replay 8c25c9e`

--replay outcome: ERROR; exit code 65

Output:
```
[ERROR] --replay: cannot read commit 8c25c9e in the current working-tree repo
  This SHA may live in an external testbed repo (e.g., ngx-smart-components).
  cd into the testbed repo and re-run --replay there for empirical evidence.
```

Verdict: PASS. Expected exit 65 + "cannot read commit 8c25c9e" error message (the SHA is not in this plugin repo; it lives in the ngx-smart-components testbed); observed: 65.

### Step 3: --replay against 06af4cf (structural error-path validation)

Command: `bash E-verify-before-commit.sh --replay 06af4cf`

--replay outcome: ERROR; exit code 65

Output:
```
[ERROR] --replay: cannot read commit 06af4cf in the current working-tree repo
  This SHA may live in an external testbed repo (e.g., ngx-smart-components).
  cd into the testbed repo and re-run --replay there for empirical evidence.
```

Verdict: PASS. Expected exit 65 + "cannot read commit 06af4cf" error message; observed: 65.

### Step 4: --replay against 15d8fac (structural error-path validation)

Command: `bash E-verify-before-commit.sh --replay 15d8fac`

--replay outcome: ERROR; exit code 65

Output:
```
[ERROR] --replay: cannot read commit 15d8fac in the current working-tree repo
  This SHA may live in an external testbed repo (e.g., ngx-smart-components).
  cd into the testbed repo and re-run --replay there for empirical evidence.
```

Verdict: PASS. Expected exit 65 + "cannot read commit 15d8fac" error message; observed: 65.

## Closure criterion

Per `07-RESEARCH-GAP-2-wip-discipline.md` revised closure pattern (matching Plan 07-07's "structurally CLOSED, empirical deferred" pattern): closure is structurally valid when (a) the synthesized in-process path-d scenario fires path-d (exit 2) within the smoke run AND (b) the --replay flag emits a clear "cannot read commit" error + exits 65 against any of the testbed-only SHAs.

| Step | Expected exit | Observed exit | Verdict |
|------|---------------|---------------|---------|
| 1: synthesized in-process scenario | 2 | 2 | PASS |
| 2: --replay 8c25c9e (testbed SHA) | 65 | 65 | PASS |
| 3: --replay 06af4cf (testbed SHA) | 65 | 65 | PASS |
| 4: --replay 15d8fac (testbed SHA) | 65 | 65 | PASS |

**Overall verdict:** PASS. All four structural-validation steps satisfied: the synthesized in-process path-d scenario fires exit 2 within the smoke run (Gap 2 closure structurally proven), and the --replay flag's error-path emits clear "cannot read commit" messages with exit 65 for all three testbed-only SHAs (flag is wired correctly).

## Manual-auditor empirical replay (out of phase-closure scope)

The --replay flag is also designed for manual-auditor use against the external `ngx-smart-components` testbed repo (where the empirical session 2 / 5 / 8 commits live). Auditors cd into that testbed and run:

```bash
cd /path/to/ngx-smart-components
bash /path/to/lz-advisor/.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/E-verify-before-commit.sh --replay 8c25c9e
# Expected (with the live commit available): exit 2 (path-d violation detected) for sessions 2 + 5;
# exit 0 (path-d N/A: no Outstanding Verification) for session 8 baseline.
```

This empirical evidence is NOT a phase-closure gate. The structural proof (synthesized in-process scenario + --replay error-path validation) is sufficient for marking Gap 2 CLOSED structurally.

## Closure status

Overall verdict is PASS. Gap 2 is structurally CLOSED at the contract + smoke layer; the 07-VERIFICATION.md amendment in Task 5 reflects this structural evidence (the synthesized in-process scenario AND the --replay error-path).

## Sources

- `07-RESEARCH-GAP-2-wip-discipline.md` Smoke fixture extension empirical replay capability section
- `07-VERIFICATION.md` Gap 2 declaration (lines 67-80)
- `uat-replay/session-notes.md` sessions 2 + 5 + 8
- E-verify-before-commit.sh after Task 2 extension (--replay flag + synthesized in-process scenario)
