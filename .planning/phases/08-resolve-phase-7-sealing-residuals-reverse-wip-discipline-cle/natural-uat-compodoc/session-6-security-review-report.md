# Security Review: Storybook Compodoc Signal Docs Integration

**Reviewed:** Compodoc + Storybook integration changes -- commits `87a982a` and `a1f53ee`

**Scope:** `package.json`, `package-lock.json`, `.storybook/main.ts`, `.storybook/preview.ts`, `.storybook/tsconfig.json`, `project.json`, `.gitignore`

**Verdict scope:** scope: security-threats

---

### Findings

`package.json:23: imp: [A08] @compodoc/compodoc@1.2.1 hasInstallScript:true runs postinstall on every npm install/CI build; hijack of pkg or transitive dep yields unconfirmed RCE on dev/CI. Run npm install --ignore-scripts in CI or pin+integrity-audit the dep tree. Confirmed Important.`

`package-lock.json:0: imp: [A06] [GHSA-fv7c-fp4j-7gwp] @babel/plugin-transform-modules-systemjs@7.12.0-7.29.0 (via @compodoc/compodoc -> @babel/core@7.28.6) generates arbitrary code from malicious input; Compodoc runs Babel over repo TypeScript, so a crafted source contribution triggers code gen on dev/CI. Run npm audit fix (non-breaking). Confirmed Important.`

`packages/ngx-smart-components/.storybook/preview.ts:3-5: imp: [A08] static import of .gitignored, build-generated documentation.json bundled into dist/storybook/ and served publicly via static-storybook target; compromised CI runner injects attacker content into distributed assets. Treat documentation.json as untrusted build artifact; verify integrity or generate in-pipeline from pinned source. Severity escalated Suggestion -> Important.`

`package-lock.json:0: sug: [A04] [GHSA-2g4f-4pwh-qvx6] ajv@8.17.1 ReDoS via $data (Compodoc-bundled @angular-devkit/core@21.1.0); impact theoretical unless Compodoc exercises $data path. Defer audit fix --force (downgrades to 1.1.0, breaking). Confirmed Suggestion.`

### Per-finding validation

Validation of Finding 3: Escalated from Suggestion to Important. The executor's hedge ("determines whether crafted JSON can achieve more than corrupted documentation display") understates the confirmed asset-exposure path. `project.json:66-87` (`build-storybook`) declares `{projectRoot}/documentation.json` as an output and emits to `dist/storybook/ngx-smart-components`; `static-storybook:95-108` serves that directory via file-server with `spa:true`. The static import guarantees the artifact is bundled regardless of content. Public hosting + untrusted build artifact = distribution-channel injection, independent of `setCompodocJson` parsing semantics.

### Threat Patterns

Findings 1, 2, 3 compose into one supply-chain-to-distribution chain more severe than any single finding. Finding 1 (postinstall RCE) and Finding 2 (Babel arbitrary-code-gen over repo TypeScript) both grant code execution on the CI runner during the build. Once on the runner, the attacker controls Finding 3's pre-condition: documentation.json is `.gitignore`d, build-generated, statically imported, and bundled into the publicly-served `dist/storybook/`. So a single CI-runner compromise (via 1 or 2) converts to persistent injection into distributed Storybook assets reaching end users -- escalating a dev-only toolchain into an external attack surface. Shared root: an unvetted 50+ dep tree with install-time and build-time code execution feeding an unverified artifact into a public output.

### Missed surfaces (optional)

`test-storybook:88-93` hardcodes `http://localhost:4200`; CI port collision or a rogue local listener on 4200 could feed interaction tests against attacker-controlled content.
