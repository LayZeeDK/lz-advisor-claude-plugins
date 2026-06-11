## Security Review Summary

Reviewed: `review-src/disk-info.ts` -- Node.js/TypeScript disk-usage module with shell exec, fsSize, and HTTP cache-write paths

### Critical

1. review-src/disk-info.ts:35: [A03] `exec('du -sh ' + path)` concatenates attacker-controlled `query.mountPath` into a shell string (e.g. `"/; rm -rf /"`). Use `execFile('du', ['-sh', path])`.
2. review-src/disk-info.ts:20: [A07] live secret `API_TOKEN` (`sk_live_...`) hardcoded in source, unrotatable, persists in git history. Move to env/secret store; rotate the leaked token now.
3. review-src/disk-info.ts:69: [A03] `exec('curl '+url+" -d '"+JSON.stringify(parsed)...)` lets shell metacharacters in `parsed` break quoting (second-order injection). Use `execFile`/`fetch` with arg array.

### Important

4. review-src/disk-info.ts:68: [A02] `writeCache` posts `API_TOKEN` over `http://cache.internal`, exposing the secret to passive network capture and proxy logs. Switch to `https://`.
5. review-src/disk-info.ts:46: [A01] unvalidated `query.mountPath` flows to `fsSize(path)` enabling traversal (`"../../etc"`) outside the intended mount. Canonicalize and allow-list against a mount-root prefix.
6. review-src/disk-info.ts:10-15: [A06] `systeminformation@3.42.0` pin predates patched command-injection advisories. Upgrade to a maintained major; confirm via `npm audit`/GHSA.

### Suggestions

7. review-src/disk-info.ts:55-60: [A09] `cacheResult` catch swallows all errors (`// swallowed`), hiding parse/cache failures and exploitation signals. Log structured error; never silently drop security-relevant failures.

### Questions

(none)

### Threat Patterns

Primary chain: findings 5/1 share the single unvalidated `query.mountPath` taint source (line 30) feeding two sinks -- `exec` (1, RCE) and `fsSize` (5, traversal). Findings 1->7->3 chain end-to-end: command-injection output flows through the silently-swallowed `JSON.parse` (7) into the second `exec` (3), and a successful write leaks `API_TOKEN` (2) over plaintext HTTP (4) -- unauthenticated input to full host compromise plus token exfiltration. Shared root: absence of an input-validation boundary at line 30. Finding 6 is an independent supply-chain surface compounding the same RCE blast radius.

Unscanned entry point: `getDiskUsage` callers (any API route invoking it) -- auth posture on that surface determines whether the chain is unauthenticated-reachable.

**Verdict scope:** scope: security-threats
