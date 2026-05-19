#!/usr/bin/env bash
# Smoke test for FIND-F-CLASS-2-OBSERVABILITY (Plan 08-07):
#   Class-2 Escalation Hook conditional firing observability against a
#   designed CVE-relevant trigger scenario forcing security-reviewer Class-2
#   escalation.
#
# Hook contract (plugins/lz-advisor/agents/security-reviewer.md lines 263-289):
#   security-reviewer emits <verify_request question=... class="2"|"2-S"
#   anchor_target="pv-..." severity=...> ... </verify_request> when:
#     (i)  it encounters a Class 2-S question (security currency / CVE /
#          advisory question on vendor library dependency) that
#     (ii) the executor's Phase 1 pre-emption did NOT anticipate AND
#    (iii) it cannot resolve from [Read, Glob] tool access alone.
#
# Trigger design (vendored-CVE pattern; chosen 2026-05-19 after observing
# executor pre-emption resolved CVE-2025-68154 (systeminformation@<5.27.14)
# and CVE-2024-21538 (cross-spawn@7.0.3) via npm audit + WebSearch in two
# canonical-prompt UAT attempts):
#   - package.json declares `file:./vendor/internal-fs-helper` dep -- bypasses
#     npm audit's GHSA database resolution (audit only handles registry tarballs)
#   - vendor/internal-fs-helper/index.js mimics the pre-patch systeminformation
#     fsSize() Windows command injection pattern (GHSA-wphj-fx3q-84ch)
#   - src/disk-info.ts wraps the vendored helper, forwarding user input
#
# Assertions (per Plan 08-07 task 1 step 6):
#   (a) BLOCKING: <verify_request class="2"> block emitted by security-reviewer
#   (b) WARN: WebSearch or WebFetch tool_use invoked (executor parsed block + escalated)
#   (c) WARN: pv-* synthesis referencing CVE (e.g., pv-cve-2025-68154-systeminformation)
#   (d) WARN: exactly 2 security-reviewer invocations (one-shot Honk re-invoke)
#
# Cost: ~$1-3 per live run.

set -eu

# Optional --from-trace flag for zero-cost replay against captured traces.
TRACE_INPUT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --from-trace)
      TRACE_INPUT="${2:?--from-trace requires a path}"
      shift 2
      ;;
    --help|-h)
      cat <<'USAGE'
Usage: bash F-class-2-escalation.sh [--from-trace <file>]

Default mode (no flags): seed scratch repo with vendored-CVE fixture, invoke
`claude -p /lz-advisor.security-review`, capture stream-json trace, run
assertions (a)-(d).

--from-trace <file>: replay mode -- skip scratch + claude -p; use <file> as
the captured trace and run assertions. Free (no API spend). Useful for
parser-iteration testing against archived 08-class-2-trigger-session.jsonl
or future regression replays.
USAGE
      exit 0
      ;;
    *)
      echo "[ERROR] Unknown argument: $1" >&2
      exit 64
      ;;
  esac
done

# Windows Git Bash compat: suppress argv path translation; convert POSIX -> Windows.
if command -v cygpath >/dev/null 2>&1; then
  export MSYS_NO_PATHCONV=1
  export MSYS2_ARG_CONV_EXCL='*'
  to_native() { cygpath -w "$1"; }
else
  to_native() { printf '%s' "$1"; }
fi

echo "F-class-2-escalation: Class-2 Escalation Hook observability fixture"
echo "Trigger: vendored copy of systeminformation@5.27.13 fsSize (GHSA-wphj-fx3q-84ch pattern)"
echo "         under file: dep to bypass npm audit GHSA resolution"
echo ""

if [ -n "$TRACE_INPUT" ]; then
  if [ ! -f "$TRACE_INPUT" ]; then
    echo "[ERROR] --from-trace file not found: $TRACE_INPUT" >&2
    exit 1
  fi
  TRACE="$(to_native "$TRACE_INPUT")"
  echo "[INFO] Replay mode: using trace $TRACE_INPUT (skipping claude -p)"
else
  # Live mode: external scratch (must be OUTSIDE the parent repo so claude -p's
  # cwd is unambiguous and `git rev-parse --show-toplevel` doesn't resolve up
  # into the parent project).
  SCRATCH="$(to_native "$(mktemp -d -t lz-advisor-f-class-2-XXXX)")"
  trap 'rm -rf "$SCRATCH"' EXIT

  PLUGIN_DIR="$(to_native "$(git rev-parse --show-toplevel)/plugins/lz-advisor")"

  mkdir -p "$SCRATCH/src" "$SCRATCH/vendor/internal-fs-helper"

  # Seed package.json: file: dep bypasses npm audit GHSA resolution
  printf '{\n  "name": "supply-chain-trigger",\n  "version": "0.0.0",\n  "dependencies": {\n    "internal-fs-helper": "file:./vendor/internal-fs-helper"\n  }\n}\n' > "$SCRATCH/package.json"

  # Seed vendored helper package.json
  printf '{\n  "name": "internal-fs-helper",\n  "version": "0.0.0",\n  "main": "./index.js"\n}\n' > "$SCRATCH/vendor/internal-fs-helper/package.json"

  # Seed vendored helper index.js: mimics pre-patch systeminformation fsSize
  # Windows command injection pattern (GHSA-wphj-fx3q-84ch)
  printf "const { exec } = require('child_process');\n\n// Forked from systeminformation@5.27.13 fsSize internals (vendored to remove\n// upstream dependency). Reviewer note: upstream has since been patched in\n// 5.27.14 (GHSA-wphj-fx3q-84ch); this vendored copy was NOT updated to\n// match. Reviewers should determine whether this code path is still vulnerable.\nfunction fsSize(drive, callback) {\n  exec('wmic logicaldisk where caption=\"' + drive + '\" get freespace,size /format:value', callback);\n}\n\nmodule.exports = { fsSize };\n" > "$SCRATCH/vendor/internal-fs-helper/index.js"

  # Seed caller src/disk-info.ts
  printf "import { fsSize } from 'internal-fs-helper';\n\nexport function getDiskSize(userInput: string): Promise<unknown> {\n  return new Promise((resolve, reject) => {\n    fsSize(userInput, (err: Error | null, output: string) => {\n      if (err) reject(err);\n      else resolve(output);\n    });\n  });\n}\n" > "$SCRATCH/src/disk-info.ts"

  cd "$SCRATCH"
  git init -q
  git -c user.email=test@test.com -c user.name=test add package.json src/disk-info.ts vendor/internal-fs-helper/package.json vendor/internal-fs-helper/index.js
  git -c user.email=test@test.com -c user.name=test commit -q -m "feat: add disk size query via vendored internal-fs-helper"

  TRACE="$SCRATCH/trace.jsonl"
  claude --model sonnet --effort medium --plugin-dir "$PLUGIN_DIR" \
    --dangerously-skip-permissions \
    -p "/lz-advisor.security-review Review the last commit for security issues." \
    --verbose --output-format stream-json > "$TRACE" 2>&1 || true
fi

FAIL=0

# Assertion (a) BLOCKING: <verify_request> block with class="2" (or class="2-S")
# emitted by security-reviewer agent. Strict pattern: opening tag with class
# attribute present. The bare token <verify_request> mentioned in prose does
# NOT satisfy this; we require the attribute-bearing form.
VR_CLASS_COUNT=$(rg -c '<verify_request[^>]*class=\\"2' "$TRACE" 2>/dev/null || echo 0)
VR_CLASS_COUNT=${VR_CLASS_COUNT:-0}
if [ "$VR_CLASS_COUNT" -ge 1 ]; then
  echo "[PASS] (a) Class-2 verify_request emitted ($VR_CLASS_COUNT block(s) with class=\"2*\")"
else
  echo "[FAIL] (a) No verify_request block with class=\"2\" or class=\"2-S\" emitted"
  echo "       Hook is correctly designed as fallback path; this scenario's executor"
  echo "       pre-emption (npm audit + WebSearch + inline source attestation) resolved"
  echo "       the Class 2-S question before consultation. To force firing, executor"
  echo "       pre-emption must fail OR the scenario must surface a question the agent"
  echo "       cannot resolve from [Read, Glob] alone after the executor's pre-empted prompt."
  FAIL=1
fi

# Assertion (b) WARN: WebSearch or WebFetch tool_use event
WS_COUNT=$(rg -cF '"name":"WebSearch"' "$TRACE" 2>/dev/null || echo 0)
WF_COUNT=$(rg -cF '"name":"WebFetch"' "$TRACE" 2>/dev/null || echo 0)
WS_COUNT=${WS_COUNT:-0}
WF_COUNT=${WF_COUNT:-0}
if [ "$WS_COUNT" -ge 1 ] || [ "$WF_COUNT" -ge 1 ]; then
  echo "[PASS] (b) Web tool invoked (WebSearch=$WS_COUNT, WebFetch=$WF_COUNT)"
else
  echo "[WARN] (b) No WebSearch/WebFetch tool_use observed (Phase 9 follow-up candidate if assertion (a) ever fires)"
fi

# Assertion (c) WARN: pv-* synthesis referencing CVE (systeminformation or GHSA-wphj-fx3q-84ch)
if rg -qi 'pv-cve-2025-68154|pv-[a-z0-9-]*systeminformation|pv-ghsa-wphj' "$TRACE" 2>/dev/null; then
  echo "[PASS] (c) pv-* synthesis references CVE / GHSA"
else
  echo "[WARN] (c) No pv-* synthesis for CVE-2025-68154 / systeminformation / GHSA-wphj-fx3q-84ch observed (Phase 9 follow-up)"
fi

# Assertion (d) WARN: exactly 2 security-reviewer invocations (one-shot Honk re-invoke)
# Pattern: count UNIQUE Agent tool_use_id values where subagent_type names
# security-reviewer. Stream-json emits the same tool_use across multiple message
# types (assistant/tool_use, system/task_started, user/parent_tool_use_id), so
# a naive line count would over-count by ~3x per invocation. Count distinct
# tool_use_id values associated with security-reviewer Agent calls.
# Extract tool_use ids associated with security-reviewer subagent_type. The
# trace emits each Agent tool_use across multiple JSONL lines (assistant
# tool_use, system task_started, user parent_tool_use_id); we count UNIQUE ids.
# Node `-e` uses argv[1] for the first user-supplied arg (no script-file slot).
SEC_INVOKES=$(node -e '
  const fs = require("fs");
  const path = process.argv[1];
  const lines = fs.readFileSync(path, "utf8").split("\n").filter(Boolean);
  const ids = new Set();
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.type === "assistant" && obj.message && obj.message.content) {
        for (const c of obj.message.content) {
          if (c.type === "tool_use" && c.name === "Agent" && c.input && c.input.subagent_type === "lz-advisor:security-reviewer") {
            ids.add(c.id);
          }
        }
      }
    } catch (e) {}
  }
  console.log(ids.size);
' "$TRACE" 2>/dev/null || echo 0)
SEC_INVOKES=${SEC_INVOKES:-0}
if [ "$SEC_INVOKES" = "2" ]; then
  echo "[PASS] (d) Exactly 2 security-reviewer invocations (initial + Spotify Honk one-shot re-invoke)"
elif [ "$SEC_INVOKES" = "1" ]; then
  echo "[WARN] (d) 1 security-reviewer invocation (no re-invoke; expected when no Class-2 escalation fires; Phase 9 follow-up if (a) ever fires)"
elif [ "$SEC_INVOKES" -ge 3 ]; then
  echo "[WARN] (d) $SEC_INVOKES security-reviewer invocations (>2; Spotify Honk one-shot principle violated)"
else
  echo "[WARN] (d) 0 security-reviewer invocations (skill phase did not consult agent)"
fi

if [ "$FAIL" -ne 0 ]; then
  echo ""
  echo "[FAIL] F-class-2-escalation.sh: assertion (a) is BLOCKING; the Class-2 Hook"
  echo "       did not emit a class=\"2\" verify_request block. See above guidance."
  echo ""
  echo "       Note: this is the EXPECTED empirical outcome under the current"
  echo "       executor pre-emption discipline (Common Contract Rule 5 + Pattern D"
  echo "       + default-on ToolSearch). The Hook is correctly designed as a"
  echo "       fallback path. This fixture documents the conditional-firing"
  echo "       observability gap for Phase 9 follow-up when a real-world scenario"
  echo "       surfaces an executor pre-emption failure."
  exit 1
fi

echo ""
echo "[SUCCESS] F-class-2-escalation.sh: Class-2 Escalation Hook fired observably"
echo "          (assertion (a) PASS); (b), (c), (d) are bonus-flow closure indicators"
