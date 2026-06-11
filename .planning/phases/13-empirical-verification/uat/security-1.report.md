## Security Review Summary

Reviewed: `review-src/disk-info.ts` -- Node.js disk-information utility module with attacker-controlled `mountPath` input flowing into shell commands and a filesystem sink.

---

### Critical

1. review-src/disk-info.ts:35: [A03] Attacker-controlled `query.mountPath` concatenated into `exec('du -sh ' + path)` yields unauthenticated RCE (e.g. `"/; rm -rf /"`). Use `execFile('du', ['-sh', path])` with arg array, plus allow-list/canonicalize path.
2. review-src/disk-info.ts:46: [A01] Same unvalidated `path` flows to `fsSize(path)`, enabling traversal (`../../etc`) and filesystem enumeration outside the mount. Canonicalize via `path.resolve` + verify prefix against an allowed-mount allow-list before the sink.
3. review-src/disk-info.ts:20: [A07] Live `sk_live_` token hardcoded as module constant; every repo reader obtains it, unrotatable without code push. Move to env/secret manager, purge from history, rotate the key now.
4. review-src/disk-info.ts:68-69: [A02] `API_TOKEN` sent over `http://` query param (logged at proxies/`cache.internal`) AND `JSON.stringify(parsed)` interpolated into single-quoted shell `curl` -- second injection sink. Use HTTPS + header auth; replace shell with `fetch`/`execFile` passing a body, never string-built shell.

### Important

5. review-src/disk-info.ts:55-61: [A09] `catch (_)` silently discards parse/cache failures -- the only signal that injection (Findings 1/4) corrupted output. Log with context + emit a metric; never swallow.
6. review-src/disk-info.ts:14-15: [A06] `systeminformation@3.42.0` predates command-injection advisories (`si.inetLatency`/`si.inetChecksite` family, CWE-78). Transitive pins evade `npm audit`. Upgrade to a patched major; confirm `fsSize` shell internals are remediated in the target version.

### Suggestions

(none)

### Questions

7. review-src/disk-info.ts:15: [A06] `systeminformation@3.42.0` -- confirm exact GHSA/CVE IDs and the fixed version before relying on the upgrade recommendation.
<verify_request question="Which published GHSA/CVE advisories affect systeminformation@3.42.0 and in which version are they fixed?" class="2-S" anchor_target="pv-systeminformation-3-42-0-cves" severity="important"/>

### Threat Patterns

Findings 1 and 4 form a dual-injection chain through one entry point: `getDiskUsage` builds two unsanitized shell strings (`du`, `curl`), and Finding 1's RCE can poison `stdout`, which flows through `cacheResult` (Finding 5 swallows the resulting parse errors) into Finding 4's second `exec` -- a self-feeding injection path where the only incident signal is silently discarded. Findings 3 and 4 compound: the hardcoded secret (3) is the exact value exfiltrated over cleartext (4), so one repo read plus one log capture fully compromises the `cache.internal` credential. Findings 2 and 6 share the unvalidated-`mountPath` root; even if the shell sink were fixed, the `fsSize` sink and the outdated dependency's own shell internals remain exploitable. The systemic root is missing input validation at the `DiskQuery.mountPath` boundary plus shell-string construction throughout -- fixing both (allow-list + `execFile`/`fetch`) collapses Findings 1, 2, and 4 simultaneously.

**Verdict scope:** scope: security-threats
