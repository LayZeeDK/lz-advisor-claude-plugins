## Security Review Summary

Reviewed: `review-src/disk-info.ts` -- disk-usage query module (review-only UAT material, not imported or executed)

### Critical

1. review-src/disk-info.ts:35: [A03] `exec('du -sh ' + path)` concatenates attacker-controlled `query.mountPath` into a shell string -- unauthenticated RCE. Use `execFile('du', ['-sh', path])` with arg array.
2. review-src/disk-info.ts:20: [A07] hardcoded live `API_TOKEN` (`sk_live_...`) exposed to any repo/history reader; unrotatable without history rewrite. Move to env/secret store, rotate the leaked token now.
7. review-src/disk-info.ts:69: [A03] `exec('curl '...JSON.stringify(parsed)...)` -- a single-quote in cached `stdout`-derived data breaks the `-d` literal, injecting shell args (second-order RCE). Use `execFile`/`fetch` with arg array.

### Important

3. review-src/disk-info.ts:46: [A01] unvalidated `path` passed to `fsSize(path)` enables traversal (`../../etc`) to read metadata outside mount scope. Canonicalize + allow-list against permitted mount prefixes.
4. review-src/disk-info.ts:68: [A02] `API_TOKEN` embedded in an `http://` URL query param leaks the secret on the wire and in access logs. Use `https`, move token to an `Authorization` header.

### Suggestions

6. review-src/disk-info.ts:55-60: [A09] `catch (_)` silently discards parse/cache/injection errors -- no trace of intrusion attempts. Log the error with context to the application error stream.

### Questions

5. review-src/disk-info.ts:10-15: [A06] `systeminformation@3.42.0` pin predates command-injection advisories. Unresolved hedge: advisory IDs unconfirmed (unverified). Verify GHSA/npm audit before relying.
<verify_request question="Are there published GHSA/CVE command-injection advisories against systeminformation@3.42.0 patched in later majors?" class="2-S" anchor_target="pv-systeminformation-3-42-0-cves" severity="important"/>

### Per-finding validation

Validation of Finding 3: held at Important (not raised). `fsSize` reads size metadata only, not file contents; traversal blast radius is enumeration/metadata disclosure, not arbitrary file read. Still exploitable unauthenticated, but lower impact than the RCE sinks.

Validation of Finding 7: raised to Critical (executor said Important under A02/A03 merged). The injection is independently exploitable RCE and warrants its own Critical finding, split per one-issue-per-finding from the A02 plaintext-transport concern (Finding 4).

### Threat Patterns

Findings 1, 7, 2, 4, 6 form one exploit chain: attacker injects via `mountPath` (1) to control `stdout`, whose JSON flows into the `curl` sink (7) for second-order injection; both `curl`/`du` processes inherit the hardcoded token (2) transmitted in cleartext (4); the swallowed catch (6) erases all evidence. Single shared root: `query.mountPath` crosses the trust boundary with zero validation, and `exec` string-concatenation is used at both sinks. Replacing both `exec` calls with `execFile` + input allow-listing collapses findings 1, 3, and 7 simultaneously.

### Missed surfaces (optional)
`getDiskUsage` returns the raw attacker-supplied `path` in its result object (line 48) -- potential reflected-output/log-injection sink if echoed to clients or logs unescaped.

---

**Verdict scope:** scope: security-threats
