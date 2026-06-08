## Security Review Summary

Reviewed: `review-src/disk-info.ts` -- Node.js/TypeScript disk-usage utility accepting attacker-controllable `mountPath`, executing shell commands, reading filesystem sizes, and transmitting results over HTTP with a hardcoded API token.

---

All 7 findings confirmed at stated lines. Severity assessments validated below.

### Critical

1. review-src/disk-info.ts:35: [A03] `exec('du -sh ' + path)` with attacker-controlled `query.mountPath` enables arbitrary OS command execution (`/; rm -rf /`). Use `execFile('du', ['-sh', path])` with arg array + mount allow-list.
2. review-src/disk-info.ts:20: [A07] live token `sk_live_...` hardcoded in source, unrotatable, persists in git history. Move to env var / secrets manager, revoke + rotate exposed token, scrub history.
3. review-src/disk-info.ts:69: [A03] `exec('curl ' + url + " -d '" + JSON.stringify(parsed) + "'")` -- single-quote in JSON breaks shell quoting, injecting tokens from upstream-poisoned stdout. Use `execFile`/`fetch` with body as discrete argument.

### Important

4. review-src/disk-info.ts:68: [A02] token sent over plaintext `http://` in query string -- exposed on wire and in proxy/access logs. Use `https://` + `Authorization: Bearer` header, not URI param.
5. review-src/disk-info.ts:46: [A01] unvalidated `path` to `fsSize` permits traversal (`../../etc/shadow`) reading arbitrary filesystem locations. Canonicalize via `path.resolve` + enforce allowed-mount prefix check.
6. review-src/disk-info.ts:10-13: [A06] declared pin `systeminformation@3.42.0` predates command-injection advisories. Unresolved hedge: advisory IDs/CVEs not packaged (unverified). Verify GHSA/npm audit before adopting; pin >=latest-patched major.

### Suggestions

7. review-src/disk-info.ts:55-60: [A09] `catch (_) {}` discards parse/write failures, erasing intrusion-detection signal from injected shell output. Log error with context to security-relevant sink; do not swallow.

### Questions

(none)

### Threat Patterns

Findings 1, 3, and 7 chain into a compounded RCE-with-cover pipeline: Finding 1 (`du -sh` injection) executes attacker commands AND poisons `stdout`; that poisoned stdout flows through `cacheResult` into Finding 3 (`curl` injection) as a second independent execution vector; Finding 7's swallowed catch erases all evidence of both. Findings 2 and 4 chain into token compromise: the secret is both readable at rest (Finding 2, source/history) and interceptable in transit (Finding 4, plaintext query param) -- defense fails at both layers. Findings 1 and 5 share a single root cause: `query.mountPath` reaches two distinct dangerous sinks (shell + filesystem) from one missing validation guard at line 30; a single allow-list + canonicalization gate at the entry point closes both. Systemic root: zero input-trust boundary plus zero output/transport hygiene around an attacker-facing entry point.

### Missed surfaces (optional)

`getDiskUsage` returns the raw `{ path, size }` to its unknown caller -- verify no downstream sink reflects `path` into a response (XSS/log-injection) or template.

---

**Verdict scope:** scope: security-threats
