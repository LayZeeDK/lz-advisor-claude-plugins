# Phase 9 Deferred Items

Out-of-scope discoveries logged during execution (NOT fixed -- pre-existing, unrelated to the rename task's changes).

## DEF-09-01: J-narrative-isolation.sh uses `grep -q` (forbidden on this box)

- **Found during:** Plan 09-02 Task 3 (smoke-fixture sweep).
- **File:** `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/J-narrative-isolation.sh:37`
- **Issue:** The assertion uses `grep -q "session.ts" "$OUT"` rather than `rg -q`. Per CLAUDE.md, the `grep` command produces silent zero results on this Windows arm64 box (vendored rg argv bug + denied tool). This fixture would false-fail (or behave unpredictably) when run on the local machine.
- **Why deferred:** Pre-existing defect unrelated to the skill-rename task. Plan 09-02's scope (D-05/D-06) is limited to updating the dotted `-p` invocation strings to the qualified colon form. Changing the assertion mechanism is a separate correctness fix outside this phase's blast radius.
- **Recommended follow-up:** Replace `grep -q` with `rg -q` in a future maintenance pass (mechanical, one-line). The other 10 fixtures already use `rg`.
