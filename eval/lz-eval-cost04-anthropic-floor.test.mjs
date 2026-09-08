// lz-eval-cost04-anthropic-floor.test.mjs
//
// Dev-time SSOT gate for COST-04 (Anthropic first-party API floor; no Bedrock/Vertex/Foundry paths).
//
// COST-04 is a deterministic contract invariant over the SHIPPED orchestrator SKILL.md: the skill must
// state the Anthropic-backed first-party runtime as the platform FLOOR and must NOT add any
// cloud-provider deployment branch or provider-specific degradation path. Until now this was verified
// only by a MANUAL `git grep` in the verification report (0 hits) -- no committed, fail-able guard.
// This test converts that manual check into a checked gate, mirroring the worker-contract SSOT pattern
// (lz-eval-worker-contract.test.mjs): a dev-only eval test that READS the shipped contract file
// (eval -> runtime, the allowed one-directional dependency) and ships nothing.
//
// It is a two-sided contract guard (NOT a hollow grep): it asserts the POSITIVE Anthropic-floor
// language is present AND the NEGATIVE that no managed-cloud-provider token leaks into the skill body.
// A future edit that adds a `bedrock`/`vertex`/`foundry` fallback branch -- or that deletes the
// Anthropic-floor statement -- fails this gate.
//
// Tree boundary: dev-only eval test. It READS the shipped SKILL.md; it ships nothing.
//
// HOST QUIRK: run via the explicit FILE form (`node --test eval/lz-eval-cost04-anthropic-floor.test.mjs`);
// the directory form spuriously exits 1 on this host.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (rel) => fs.readFileSync(new URL(rel, import.meta.url), 'utf8');

const SKILL = read('../plugins/lz-advisor/skills/lz-deep-research/SKILL.md');

// The managed-cloud-provider deployment surfaces COST-04 forbids in the shipped skill body. These are
// the provider names a degradation/branching path would name; their ABSENCE is the negative invariant.
const FORBIDDEN_PROVIDERS = ['bedrock', 'vertex', 'foundry'];

test('COST-04 negative: the shipped SKILL.md names NO managed-cloud-provider deployment (no Bedrock/Vertex/Foundry branch)', () => {
  const haystack = SKILL.toLowerCase();

  for (const provider of FORBIDDEN_PROVIDERS) {
    assert.ok(
      !haystack.includes(provider),
      'SKILL.md must NOT name the managed-cloud provider "' + provider + '" (COST-04 Anthropic-API floor; no provider branching)',
    );
  }
});

test('COST-04 positive: the shipped SKILL.md states the Anthropic first-party runtime as the platform FLOOR', () => {
  // The floor must be asserted affirmatively -- not merely "no provider token present" (which an empty
  // file would also satisfy). This pins the positive contract language (SKILL.md lines 44-47).
  assert.ok(
    /anthropic/i.test(SKILL),
    'SKILL.md must reference the Anthropic-backed first-party runtime',
  );
  assert.ok(
    /\bfloor\b/i.test(SKILL),
    'SKILL.md must declare the first-party runtime the platform FLOOR',
  );
  assert.ok(
    /agent tool|agent call|agent invocation|via the agent/i.test(SKILL),
    'SKILL.md must orchestrate via the Agent tool, never direct API calls',
  );
});

test('COST-04 negative: no provider-specific degradation/branching prose leaks into the skill body', () => {
  // Guard the intent, not just the literal product names: a branch that conditions behavior on a
  // cloud-provider deployment would pair a provider word with a branching verb. Since no provider word
  // is present at all (asserted above), the conjunction is vacuously absent; this test fails the moment
  // a provider word is reintroduced ALONGSIDE branching prose.
  const haystack = SKILL.toLowerCase();
  const branchingProse = /(deploy|fallback|degrade|branch).{0,40}(bedrock|vertex|foundry)/s;

  assert.ok(
    !branchingProse.test(haystack),
    'SKILL.md must NOT add a provider-specific deployment/degradation branch (COST-04)',
  );
});
