---
phase: 08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle
plan: 07
type: execute
wave: 2
depends_on: [01]
files_modified:
  - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh
  - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl
autonomous: false
requirements: [FIND-F-CLASS-2-OBSERVABILITY]
requirements_addressed: [FIND-F-CLASS-2-OBSERVABILITY]
target_version_at_merge: 0.14.0
tags: [class-2-observability, cve-trigger, security-reviewer, uat, new-smoke-fixture]

must_haves:
  truths:
    - "F-class-2-escalation.sh fixture exists and designs a CVE-relevant scenario forcing security-reviewer Class-2 escalation"
    - "08-class-2-trigger-session.jsonl captures one full UAT trace; contains <verify_request class=\"2\"> (or class=\"2-S\") block emitted by security-reviewer"
    - "Trace contains WebSearch or WebFetch tool_use event (executor parsed verify_request + invoked web tool)"
    - "Trace contains pv-* synthesis referencing the CVE (e.g., pv-cve-2025-68154-systeminformation)"
    - "Trace contains a SECOND security-reviewer invocation (one-shot re-invocation per Spotify Honk principle)"
    - "Second security-reviewer invocation references the synthesized pv-* anchor (closure of the Class-2 hedge)"
    - "Plan 07-13 ## Class-2 Escalation Hook section in agents/security-reviewer.md is preserved verbatim (no modification)"
  artifacts:
    - path: ".planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh"
      provides: "Designed-trigger fixture forcing security-reviewer Class-2 escalation against CVE-2025-68154 (systeminformation@<5.27.14)"
      contains: "scratch repo with package.json pinning systeminformation@5.27.13 + src/disk-info.ts calling fsSize(userInput); claude -p invocation; <verify_request class= assertion"
    - path: ".planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl"
      provides: "Captured UAT session trace for audit + Phase 9 follow-up"
      contains: "1 verify_request class=\"2\" block + WebSearch/WebFetch tool_use + pv-* synthesis + 2 security-reviewer invocations"
  key_links:
    - from: "Plan 07-13 ## Class-2 Escalation Hook section in agents/security-reviewer.md"
      to: "F-class-2-escalation.sh fixture verifies hook fires"
      via: "designed CVE-relevant trigger scenario"
      pattern: "<verify_request class=\"2"
---

<objective>
Close FIND-F-CLASS-2-OBSERVABILITY (P3 carry-forward). Plan 07-13 structurally added `## Class-2 Escalation Hook` section to `agents/security-reviewer.md` (lines 263-289 per RESEARCH) mirroring the reviewer.md analog. No natural UAT triggered the hook -- Phase 7 UAT S3 + S4 emitted zero `<verify_request>` blocks. The PARTIAL row in Plan 07-13 closed without conditional-firing observability evidence.

Plan 7 designs a deliberate CVE-relevant trigger scenario forcing security-reviewer Class-2 escalation, runs 1 UAT session, captures the trace, and verifies:
- (a) security-reviewer emits `<verify_request>` block with `class="2"` (or `class="2-S"` per Plan 06-06 sub-pattern)
- (b) executor parses the block + invokes WebSearch / WebFetch
- (c) executor synthesizes pv-* anchors from the web result
- (d) executor re-invokes security-reviewer ONCE (Spotify Honk one-shot principle, Phase 7 D-04)
- (e) second security-reviewer invocation closes the Class-2 hedge with anchored citation

CVE chosen per RESEARCH recommendation: **CVE-2025-68154 (systeminformation@<5.27.14)** -- command injection on Windows; published 2025-12-16 (post-Sonnet 4.6 training cutoff hedge); narrow version range; trivial PoC (`fsSize("; calc.exe;")`).

Purpose: Empirically validate the Class-2 Escalation Hook fires end-to-end on a real-world security-review scenario. Close the PARTIAL row from Plan 07-13.

Output: 1 new smoke fixture + 1 captured UAT trace; visible `<verify_request class="2">` block; web-tool invocation; pv-* synthesis; re-invocation with anchored closure.
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
@.planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-13-SUMMARY.md

<interfaces>
<!-- Class-2 Escalation Hook canonical surface (preserved verbatim, NOT modified by this plan) -->

Plan 07-13 added `## Class-2 Escalation Hook` section to plugins/lz-advisor/agents/security-reviewer.md (lines 263-289 per RESEARCH). This plan READS that section to understand the contract but does NOT modify it.

Verify_request schema at plugins/lz-advisor/references/context-packaging.md lines 369-409:
```xml
<verify_request question="..." class="2" anchor_target="pv-cve-..." severity="critical|important|suggestion">
  <context>...</context>
</verify_request>
```

CVE trigger candidate (HIGH confidence per RESEARCH):
- **CVE-2025-68154** (systeminformation command injection on Windows)
- Vulnerable: < 5.27.14
- Patched: 5.27.14
- Published: 2025-12-16
- PoC: `fsSize("; calc.exe;")` -- Windows-only command injection
- GHSA: search GHSA-cve-2025-68154 (Plan 7 executor will resolve current advisory ID at runtime via WebSearch)

Fallback CVE if Sonnet 4.6 resolves CVE-2025-68154 from training:
- CVE-2024-21538 cross-spawn (ReDoS in widely-used transitive)
- CVE-2024-21529 dset (prototype pollution)

Standard fixture pattern (from B-pv-validation.sh / D-security-reviewer-budget.sh):
- Shebang + set -euo pipefail
- SCRATCH directory + trap cleanup
- Seed package.json + src files
- git init + initial commit (so security-review has "the last commit" to scan)
- claude -p invocation
- Parse JSONL trace; assert expected blocks
- exit 0 on PASS; exit 1 on FAIL
</interfaces>
</context>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| smoke fixture scratch repo | Sandbox; nothing installed or executed beyond synthetic source-text references |
| claude -p invocation | Reads scratch repo files; produces stream-json trace |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-8-07-01 | Elevation of Privilege / Tampering | CVE PoC in scratch repo | mitigate | The smoke fixture seeds a scratch repo with a vulnerable package version BUT DOES NOT install or execute the vulnerable function. The `claude -p` invocation runs `/lz-advisor.security-review` which Read-only-scans the code. No actual CVE exploitation. The PoC `fsSize("; calc.exe;")` appears as inert text in src/disk-info.ts, never invoked. |
| T-8-07-02 | N/A | new shell smoke fixture | accept | New smoke fixture executes in dev environment with standard shell utilities. Mirrors existing D-* / E-* / B-* fixture pattern. The CVE prompt text references real CVE data (CVE-2025-68154 per researcher) but no actual install. The UAT exercises agent emission of `<verify_request class="2">` against the prompt; no vulnerable code path executed. |
</threat_model>

<tasks>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 1: Run designed-trigger UAT session for security-reviewer Class-2 escalation + capture trace</name>
  <files>.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl, .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/scratch-cve-trigger/ (ephemeral)</files>
  <read_first>
    - plugins/lz-advisor/agents/security-reviewer.md (lines 263-289 ## Class-2 Escalation Hook section -- preserve verbatim)
    - plugins/lz-advisor/references/context-packaging.md (lines 369-409 verify_request schema)
    - .planning/phases/07-address-all-phase-5-x-and-6-uat-findings/07-13-SUMMARY.md (Class-2 hook structural addition rationale)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Plan 7 CVE candidates table + Plan 7 trigger scenario file structure)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (Plan 7 description + Claude's Discretion fixture extension vs standalone)
  </read_first>
  <action>
    This is a checkpoint:human-verify task. The operator (executor agent) performs the automated steps below to capture the trigger UAT trace. After the trace is captured, the executor presents the assertions for human spot-check approval before plan 7 closes.

    All concrete steps (scratch repo seeding, claude -p invocation, trace assertions) are documented verbatim in <how-to-verify> below. The operator follows them as a script. The human approves once the trace shows at least assertion (a) PASS.
  </action>
  <what-built>
    A scratch repo containing a deliberately-vulnerable package version + a source file calling the vulnerable function. The claude -p invocation runs /lz-advisor.security-review against this scenario. The expected agent behavior is to emit `<verify_request class="2">` (or class="2-S") because security-reviewer cannot resolve the CVE-class question from [Read, Glob] alone -- it needs WebSearch / WebFetch authority.
  </what-built>
  <how-to-verify>
    1. Create a scratch directory: `mkdir -p .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/scratch-cve-trigger`

    2. Seed package.json:
       ```json
       {
         "name": "cve-trigger-scratch",
         "version": "0.0.0",
         "dependencies": {
           "systeminformation": "5.27.13"
         }
       }
       ```

    3. Seed src/disk-info.ts:
       ```typescript
       import { fsSize } from 'systeminformation';

       export async function getDiskSize(userInput: string): Promise<unknown> {
         // Note: userInput passed directly to fsSize without sanitization
         return await fsSize(userInput);
       }
       ```

    4. git init + initial commit:
       ```
       cd scratch-cve-trigger
       git init
       git add package.json src/disk-info.ts
       git commit -m "feat: add disk size query using systeminformation"
       ```

    5. Run the canonical UAT invocation with stream-json output captured:
       ```
       claude --model sonnet --effort medium --plugin-dir <repo-root>/plugins/lz-advisor \
         -p "/lz-advisor.security-review Review the last commit for security issues." \
         --verbose --output-format stream-json 2>&1 | tee ../08-class-2-trigger-session.jsonl
       ```

    6. After the session completes (max ~5min), verify the captured JSONL contains:

       a. `<verify_request` block with `class="2"` (or `class="2-S"` per Plan 06-06 Compodoc-1.2.1 worked-example sub-pattern):
          ```
          rg -F '<verify_request' .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl
          rg -F 'class="2' .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl
          ```

       b. WebSearch or WebFetch tool_use event:
          ```
          rg -F '"name":"WebSearch"' .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl
          rg -F '"name":"WebFetch"' .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl
          ```

       c. pv-* synthesis referencing the CVE:
          ```
          rg -i "pv-cve-2025-68154\|pv-.*systeminformation" .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl
          ```

       d. Second security-reviewer invocation (one-shot re-invocation):
          ```
          rg -c '"agent":"security-reviewer"' .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl
          ```
          Should return 2 (initial scan invocation + re-invocation with pv-* anchor).

    7. If any check fails:
       - Check (a) FAILED: the hook didn't fire. Try alternative CVE per RESEARCH (CVE-2024-21538 cross-spawn ReDoS, CVE-2024-21529 dset prototype pollution).
       - Check (b) FAILED: executor parsed the verify_request but didn't invoke web tools. Document as Phase 9 follow-up (executor verification-flow gap).
       - Check (c) FAILED: executor invoked web tools but didn't synthesize pv-*. Document as Phase 9 follow-up (pv-* synthesis-flow gap).
       - Check (d) FAILED: no re-invocation. Document as Phase 9 follow-up (one-shot-Honk-flow gap).

    8. Once at least check (a) passes, the Class-2 hook is observably firing. (b), (c), (d) are bonus -- the structural goal of Plan 07-13 is met if the hook just fires; the rest is closure of the Class-2 hedge end-to-end.

    9. Cleanup the scratch repo: `rm -rf scratch-cve-trigger` (the JSONL trace is preserved in `.planning/...` as the durable audit record).
  </how-to-verify>
  <resume-signal>Type "approved" once trace is captured + all 4 assertions (a)-(d) verified, OR describe which assertions failed for Phase 9 follow-up.</resume-signal>
  <verify>
    <automated>test -f .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl && rg -qF '<verify_request' .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl && rg -qF 'class="2' .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl</automated>
  </verify>
  <acceptance_criteria>
    - `08-class-2-trigger-session.jsonl` exists at the expected path
    - Trace contains at least one `<verify_request` block with `class="2"` (or `class="2-S"`)
    - Trace contains at least one WebSearch or WebFetch tool_use event (bonus; flagged for Phase 9 if missing)
    - Trace contains pv-* synthesis referencing CVE-2025-68154 or equivalent (bonus; flagged for Phase 9 if missing)
    - Trace contains exactly 2 security-reviewer invocations (initial + one-shot re-invoke; bonus; flagged for Phase 9 if 1 or >2)
    - Cost: ~$1-3 per UAT session at canonical claude -p rates
  </acceptance_criteria>
  <done>
    Class-2 Escalation Hook empirically fires on a designed-trigger scenario; UAT trace captured for audit; any gaps documented for Phase 9 follow-up.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Write F-class-2-escalation.sh smoke fixture wrapping the trigger scenario for repeatable validation</name>
  <files>.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh</files>
  <read_first>
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-class-2-trigger-session.jsonl (Task 1 captured trace as reference for what assertions should match)
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/D-security-reviewer-budget.sh (existing fixture as structural template: scratch-repo setup; claude -p invocation; assertion logic; trap cleanup)
    - .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/B-pv-validation.sh (existing pv-validation fixture; assertion patterns)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-CONTEXT.md (Plan 7 description + Claude's Discretion: standalone F-class-2-escalation.sh suggested)
    - .planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-RESEARCH.md (Plan 7 trigger scenario file structure + Pitfall 4 stale-CVE pitfall)
  </read_first>
  <action>
    Create `.planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh` as a repeatable smoke fixture wrapping Task 1's trigger scenario. Use letter F (per CONTEXT.md Claude's Discretion -- F is unused at smoke-test level and is the natural FIND-F anchor).

    Structure (mirror D-security-reviewer-budget.sh):

    1. Shebang + set -euo pipefail + ASCII-only output.
    2. Top of script:
       ```bash
       #!/usr/bin/env bash
       set -euo pipefail

       echo "F-class-2-escalation: Class-2 Escalation Hook observability fixture"
       echo "Validates: <verify_request class=\"2\"> + WebSearch/WebFetch + pv-* synthesis + re-invoke"
       echo ""

       SCRATCH=$(mktemp -d -t F-class-2-XXXXX)
       trap 'rm -rf "$SCRATCH"' EXIT
       cd "$SCRATCH"
       ```

    3. Seed package.json + src/disk-info.ts (verbatim per Task 1 verification block).

    4. git init + commit:
       ```bash
       git init -q
       git add package.json src/disk-info.ts
       git -c user.email=test@test.com -c user.name=test commit -q -m "feat: add disk size query using systeminformation"
       ```

    5. Run claude -p with output capture:
       ```bash
       TRACE="$SCRATCH/trace.jsonl"
       claude --model sonnet --effort medium --plugin-dir "$REPO_ROOT/plugins/lz-advisor" \
         -p "/lz-advisor.security-review Review the last commit for security issues." \
         --verbose --output-format stream-json > "$TRACE" 2>&1
       ```
       Note: REPO_ROOT must be passed as env var or computed via `$(git rev-parse --show-toplevel)` from outside the SCRATCH cd.

    6. Assertions (rg-based for clarity):
       ```bash
       FAILED=0

       if rg -qF '<verify_request' "$TRACE" && rg -qF 'class="2' "$TRACE"; then
         echo "[PASS] (a) Class-2 verify_request emitted"
       else
         echo "[FAIL] (a) No Class-2 verify_request emitted"
         FAILED=1
       fi

       if rg -qF '"name":"WebSearch"' "$TRACE" || rg -qF '"name":"WebFetch"' "$TRACE"; then
         echo "[PASS] (b) WebSearch or WebFetch tool_use invoked"
       else
         echo "[WARN] (b) No web-tool tool_use observed (Phase 9 follow-up candidate)"
       fi

       if rg -qi "pv-cve-2025-68154|pv-.*systeminformation" "$TRACE"; then
         echo "[PASS] (c) pv-* synthesis references CVE"
       else
         echo "[WARN] (c) No pv-* synthesis observed (Phase 9 follow-up candidate)"
       fi

       SEC_INVOKES=$(rg -c '"agent":"security-reviewer"' "$TRACE" || echo 0)
       if [ "$SEC_INVOKES" = "2" ]; then
         echo "[PASS] (d) Exactly 2 security-reviewer invocations (one-shot Honk)"
       else
         echo "[WARN] (d) Expected 2 security-reviewer invocations; got $SEC_INVOKES"
       fi

       exit "$FAILED"
       ```

    7. Note: only assertion (a) is exit-1-blocking (the structural goal of Plan 07-13). Assertions (b), (c), (d) emit `[WARN]` lines for audit but don't fail the fixture -- they're "bonus closure" of the full Class-2 flow.

    8. Run `bash -n F-class-2-escalation.sh` to validate syntax.

    9. Optionally run the fixture (cost: ~$1-3 per run): `bash F-class-2-escalation.sh`. Expected verdict: at least (a) PASS; (b)-(d) bonus.

    Use Write tool to create the fixture. The Task 1 captured trace is the reference for what assertions should match.
  </action>
  <verify>
    <automated>test -f .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh && bash -n .planning/phases/05.4-address-uat-findings-a-k/smoke-tests/F-class-2-escalation.sh</automated>
  </verify>
  <acceptance_criteria>
    - `F-class-2-escalation.sh` exists at the expected path
    - `bash -n F-class-2-escalation.sh` exits 0 (valid syntax)
    - The fixture creates a scratch repo + traps cleanup
    - The fixture invokes `claude -p` with the CVE-trigger prompt
    - The fixture asserts (a) Class-2 verify_request emitted (exit-1-blocking)
    - The fixture emits informational [WARN] / [PASS] lines for (b), (c), (d)
    - The fixture references CVE-2025-68154 in its assertion regex (or the alternative CVE if Task 1 had to fall back)
  </acceptance_criteria>
  <done>
    Smoke fixture exists, validates syntactically, references the Task-1-validated CVE; can be re-run for Phase 9 regression checks.
  </done>
</task>

</tasks>

<verification>
After both tasks:

1. `08-class-2-trigger-session.jsonl` exists with at least `<verify_request class="2">` block (assertion a PASS).
2. `F-class-2-escalation.sh` exists; `bash -n` validates.
3. The fixture's exit-1-blocking assertion matches the trace evidence.
4. Plan 07-13 Class-2 Escalation Hook section in agents/security-reviewer.md is unchanged (`git diff plugins/lz-advisor/agents/security-reviewer.md` returns empty for this plan).
5. SUMMARY documents which assertions (a)-(d) passed + which need Phase 9 follow-up.
</verification>

<success_criteria>
- FIND-F-CLASS-2-OBSERVABILITY closes with empirical evidence (verify_request block emitted)
- Plan 07-13 PARTIAL row resolved
- Repeatable fixture exists for Phase 9 regression validation
- Any bonus-flow gaps (b)/(c)/(d) documented for Phase 9 if they don't fire
</success_criteria>

<output>
After completion, create `.planning/phases/08-resolve-phase-7-sealing-residuals-reverse-wip-discipline-cle/08-07-SUMMARY.md` documenting:
- CVE chosen (CVE-2025-68154 or fallback) + rationale
- Trigger scenario design (package.json + source file)
- UAT session command + cost
- Per-assertion verdict: (a) Class-2 emit, (b) WebSearch/WebFetch, (c) pv-* synthesis, (d) re-invocation count
- Phase 9 follow-up candidates if any of (b)-(d) failed
- Plan 07-13 Class-2 Escalation Hook section preserved verbatim (confirm via `git diff`)
- Trace file path for audit
</output>