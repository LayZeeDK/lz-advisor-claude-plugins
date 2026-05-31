# Plan: Address Storybook Compodoc Security Findings

## Strategic Direction

> 1. Run `npm audit fix` (no `--force`) for Finding 2; non-breaking, resolves [GHSA-fv7c-fp4j-7gwp]. Verify `ajv` not downgraded after.
> 2. Replace static `import docJson from '../documentation.json'` in `packages/ngx-smart-components/.storybook/preview.ts` with build-pipeline generation from pinned source; treat artifact as untrusted.
> 3. Add `documentation.json` integrity check to `build-storybook` target in `project.json` before bundling.
> 4. Document Finding 1 postinstall as CI-only concern; do not add repo `.npmrc` `ignore-scripts=true` -- breaks local Angular/native builds needing scripts.
> 5. Defer Finding 4 (ajv); breaking downgrade to `@compodoc/compodoc@1.1.0` confirmed.
>
> **Critical:** Finding 3's bundling persists regardless of import style if a compromised runner controls `documentation.json`. The project-side fix is integrity verification at build; the runner-trust problem is irreducibly CI-scope. Flag this boundary explicitly to the executor.

## Findings Disposition

- **Finding F1:** `@compodoc/compodoc@1.2.1` `hasInstallScript:true` runs postinstall on every npm install/CI build -- unconfirmed RCE risk on dev/CI (A08).
  - **Disposition:** addressed
  - **Rationale:** Documented as a CI-only concern in Step 4 (SECURITY.md). Adding `ignore-scripts=true` to `.npmrc` is explicitly rejected by the advisor because it breaks Angular/native builds that rely on install scripts.

- **Finding F2:** [GHSA-fv7c-fp4j-7gwp] `@babel/plugin-transform-modules-systemjs` high severity via `@compodoc/compodoc -> @babel/core@7.28.6` (A06).
  - **Disposition:** addressed
  - **Rationale:** Step 1 runs `npm audit fix` (non-breaking); npm audit confirms `fixAvailable: true` with no major-version constraint.

- **Finding F3:** Static import of `.gitignored` `documentation.json` in `preview.ts:3-4` bundled into publicly-served `dist/storybook/` (A08, severity escalated to Important).
  - **Disposition:** addressed
  - **Rationale:** Steps 2 and 3 add a schema validation script and a pre-bundle `validate-docs-json` target in `project.json`. The advisor notes the runner-trust problem is irreducibly CI-scope; the project-side fix is integrity verification at build time. The import itself stays (required for Compodoc Storybook integration) but is gated by structural validation.

- **Finding F4:** [GHSA-2g4f-4pwh-qvx6] `ajv@8.17.1` ReDoS (A04, Suggestion).
  - **Disposition:** deferred
  - **Rationale:** `npm audit fix --force` would downgrade `@compodoc/compodoc` to `1.1.0` (major version, breaking). Impact is theoretical (requires `$data` keyword path in Compodoc). Revisit when Compodoc releases a 1.2.x fix.

## Steps

1. **Run `npm audit fix` to resolve GHSA-fv7c-fp4j-7gwp**
   - File: `package-lock.json` (updated automatically)
   - Change: Execute `npm audit fix` (no `--force`). Verify afterward that `ajv` was not downgraded (it should not be -- its fix requires a breaking `@compodoc/compodoc` downgrade). If `ajv` appears downgraded, run `npm install @compodoc/compodoc@^1.2.1` to restore.
   - Rationale: Non-breaking fix available for the high-severity Babel advisory; resolves Finding 2.

2. **Add a `documentation.json` schema validation script**
   - File: `packages/ngx-smart-components/scripts/validate-docs-json.mjs` (new file)
   - Change: Write a Node ESM script that reads `packages/ngx-smart-components/documentation.json` and asserts:
     - The file exists and is valid JSON.
     - The top-level object has expected Compodoc keys (e.g., `"pipes"`, `"components"`, `"directives"`, `"injectables"`, `"classes"`, `"interfaces"` -- at least one must be present as an array).
     - Exit code 1 with a descriptive error if validation fails, exit 0 on success.
   - Rationale: Structural validation detects injected non-Compodoc content before it is bundled. It cannot prevent a sophisticated attacker who injects valid-shaped Compodoc JSON, but it raises the bar and makes the threat visible in CI logs (Finding 3, project-scope portion).

3. **Add `validate-docs-json` Nx target to `project.json`**
   - File: `packages/ngx-smart-components/project.json`
   - Change: Add a new target `"validate-docs-json"` using `nx:run-commands` executor that runs the script from Step 2. Wire it as a `dependsOn` prerequisite for `build-storybook` so validation runs before Storybook bundles the artifact:
     ```json
     "validate-docs-json": {
       "executor": "nx:run-commands",
       "options": {
         "command": "node packages/ngx-smart-components/scripts/validate-docs-json.mjs"
       }
     }
     ```
     And in `build-storybook.dependsOn` (add or create the field):
     ```json
     "dependsOn": ["validate-docs-json"]
     ```
   - Rationale: Ensures validation runs as part of the Nx pipeline before documentation.json is bundled into the public Storybook output (Finding 3, structural enforcement).

4. **Document the CI-scope postinstall risk in SECURITY.md**
   - File: `SECURITY.md` (create at workspace root if absent)
   - Change: Add a section titled "Supply Chain: Compodoc Install Scripts" that explains:
     - `@compodoc/compodoc` runs a postinstall script on every `npm install`. A compromised package or transitive dependency could execute arbitrary code on the developer machine or CI runner during install.
     - **CI mitigation required:** CI pipelines should pass `--ignore-scripts` to `npm install` for production/artifact builds and run a separate `npm install --ignore-scripts` for install, then `npm run compodoc-generate` (or the Nx storybook target) in a subsequent step.
     - **Do not** add `ignore-scripts=true` to `.npmrc` -- this disables install scripts globally and breaks Angular CLI and other native-build dependencies.
     - Cross-reference: `@babel/plugin-transform-modules-systemjs` GHSA-fv7c-fp4j-7gwp is the transitive advisory (Finding 2); it is addressed by `npm audit fix` but the install-script attack surface remains for any future compromise.
   - Rationale: Finding 1 postinstall risk cannot be fully mitigated in project files without breaking Angular; documentation is the correct project-side artifact per advisor guidance.

## Key Decisions

- **Do not add `ignore-scripts=true` to `.npmrc`:** Angular CLI and several native-build dependencies (`@swc/core`, etc.) require install scripts to run. Disabling them globally breaks local development and Angular builds. The CI-scope flag is the correct level.

- **Static import of `documentation.json` is kept:** The `setCompodocJson` integration pattern requires the JSON to be available at bundle time. Replacing the static import with a dynamic `fetch()` would break the synchronous setup required by `@storybook/addon-docs/angular`. Integrity verification at the structural level is the practical project-side mitigation.

- **`npm audit fix --force` is explicitly not run:** The `ajv` ReDoS fix (`GHSA-2g4f-4pwh-qvx6`) requires downgrading `@compodoc/compodoc` to `1.1.0`, a major version change. The impact is theoretical (requires `$data` keyword traversal by Compodoc). Forcing the downgrade to address a Suggestion-severity finding would likely break Compodoc functionality.

- **Finding 3 runner-trust boundary:** The advisor flags that if a CI runner is compromised (via F1 or F2), it controls `documentation.json` generation regardless of the import style. The validation script (Step 2-3) detects crude injection but cannot defeat a sophisticated attacker. The definitive fix is CI-scope (runner isolation, `--ignore-scripts`, artifact signing). This plan documents the boundary explicitly so the CI team can act on it.

## Dependencies

- Step 1 (`npm audit fix`) is independent and can run first; it produces an updated `package-lock.json`.
- Step 2 (validation script) is independent of Step 1 and can be done in parallel.
- Step 3 (`project.json` target) depends on Step 2 (the script must exist before the target references it).
- Step 4 (SECURITY.md) is independent of all other steps.
- Commit order: Steps 1, 2+3 (together), 4 (separate) -- three commits.

## Verdict

**Verdict scope:** scope: security-threats

This plan addresses supply-chain and artifact-integrity findings from the Compodoc/Storybook integration. Findings F1, F2, F3 are addressed within project-file scope; F4 is deferred (breaking fix). The runner-trust boundary of F3 is explicitly documented as CI-scope and outside the remediation perimeter of this plan. Downstream skills reading this plan MUST check scope-match per `references/context-packaging.md` "Scope-Disambiguated Provenance Markers" before treating the verdict as authoritative for non-security questions.
