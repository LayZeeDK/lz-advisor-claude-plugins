// lz-eval-p23-resolvability.test.mjs
//
// Co-test for the ENV-04 LIVE half (Plan 23-03, Task 2; NO MODEL SPEND, NO REAL NETWORK REQUEST).
//
// EVERY case here is driven by a STUB fetcher. `checkResolvability` takes its transport as an injected
// parameter precisely so this file can run offline, and the whole point of that injection is that the
// controls guarding the eval tree's first outbound network surface can be proven without egress. If a
// case ever reached the real network, the outcome it asserted would depend on the day's connectivity
// and on link rot, which is exactly what the frozen limits exist to keep out of the record.
//
// Asserted behaviors (one named test each, never a tautology):
//   - SCHEME_ALLOWLIST / RESOLVE_LIMITS / RESOLVE_OUTCOMES are exported and Object.frozen, and
//     RESOLVE_LIMITS reads 10000, 262144 and 3.
//   - a 200 is resolvable; a 404 and a 403 are dead.
//   - BOUNDARY: a body at exactly MAX_BYTES is resolvable, one byte more is oversize.
//   - BOUNDARY: exactly MAX_REDIRECT_HOPS hops resolve, a fourth is redirect-limit.
//   - BOUNDARY: a stub that settles before the deadline resolves, one that never settles times out
//     against the frozen TIMEOUT_MS.
//   - a non-http(s) identifier and a redirect TO a non-http(s) scheme are scheme-blocked, and the stub
//     is never invoked for that target.
//   - no request carries credentials, cookies or an authorization header.
//   - each record's key set is EXACTLY the five allowed keys, so no response body can reach the output.
//   - the envelope's checkedAt comes from the injected clock.
//   - a non-array identifiers argument and a non-string / empty identifier are each a ContractError.
//
// DISCRIMINATION: the scheme cases assert the stub was NEVER CALLED for the blocked target, not merely
// that the outcome string matched. An implementation that fetched first and classified afterwards would
// return the same outcome and still be an SSRF (T-23-05), so the call-log assertion is the real proof.
// The byte and hop cases assert the limit AND one step either side; a cap asserted only well inside its
// own boundary is a cap on paper.
//
// HOST QUIRK (load-bearing): on this host the phase gate MUST target the explicit FILE form:
//   node --test eval/lz-eval-p23-resolvability.test.mjs
// The directory form (`node --test <dir>`) spuriously exits 1 on this host even when every test passes.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ContractError } from '../plugins/lz-advisor/skills/lz-deep-research/scripts/lz-deep-research-aggregate.mjs';

import {
  RESOLVE_LIMITS,
  RESOLVE_OUTCOMES,
  SCHEME_ALLOWLIST,
  checkResolvability,
} from './lz-eval-p23-resolvability.mjs';

const FIXED_NOW = () => new Date('2026-09-07T12:00:00.000Z');
// A deadline timer that never fires: the fetch always wins the race, so these cases exercise the
// non-timeout paths without waiting on a real clock.
const NEVER = () => new Promise(() => {});

function headersWith(map) {
  return { get: (name) => map[name.toLowerCase()] ?? null };
}

// A stub fetcher that logs every URL it is asked for. The log is the SSRF proof.
function loggingStub(handler) {
  const calls = [];
  const fetchImpl = (url, init) => {
    calls.push({ url, init });

    return Promise.resolve(handler(url));
  };

  return { calls, fetchImpl };
}

async function checkOne(identifier, handler, overrides = {}) {
  const { calls, fetchImpl } = loggingStub(handler);
  const envelope = await checkResolvability({
    identifiers: [identifier],
    fetchImpl,
    now: FIXED_NOW,
    delay: NEVER,
    ...overrides,
  });

  return { record: envelope.records[0], envelope, calls };
}

test('ENV-04 live: the frozen network controls are exported, Object.frozen, and read their frozen values', () => {
  assert.ok(Object.isFrozen(SCHEME_ALLOWLIST), 'SCHEME_ALLOWLIST must be Object.frozen');
  assert.ok(Object.isFrozen(RESOLVE_LIMITS), 'RESOLVE_LIMITS must be Object.frozen');
  assert.ok(Object.isFrozen(RESOLVE_OUTCOMES), 'RESOLVE_OUTCOMES must be Object.frozen');

  assert.deepEqual(SCHEME_ALLOWLIST, ['http:', 'https:'], 'an ALLOWLIST of two schemes, not a denylist');
  assert.equal(RESOLVE_LIMITS.TIMEOUT_MS, 10000);
  assert.equal(RESOLVE_LIMITS.MAX_BYTES, 262144);
  assert.equal(RESOLVE_LIMITS.MAX_REDIRECT_HOPS, 3);
  assert.deepEqual(Object.values(RESOLVE_OUTCOMES).sort(), [
    'dead',
    'network-error',
    'oversize',
    'redirect-limit',
    'resolvable',
    'scheme-blocked',
    'timeout',
  ]);
});

test('ENV-04 live: a 200 is resolvable and a 404 or 403 is dead', async () => {
  const ok = await checkOne('arxiv:2306.15595', () => ({ status: 200, headers: headersWith({}), body: 'hello' }));

  assert.equal(ok.record.outcome, RESOLVE_OUTCOMES.RESOLVABLE);
  assert.equal(ok.record.status, 200);
  assert.equal(ok.record.requestUrl, 'https://arxiv.org/abs/2306.15595', 'the arxiv: identifier maps to /abs/');

  for (const status of [404, 403, 500]) {
    const gone = await checkOne('url:example.com/p', () => ({ status, headers: headersWith({}), body: '' }));

    assert.equal(gone.record.outcome, RESOLVE_OUTCOMES.DEAD, 'status ' + status + ' must be dead');
    assert.equal(gone.record.status, status);
  }
});

test('ENV-04 live: the canonical identifier prefixes map to the URLs actually requested', async () => {
  const handler = () => ({ status: 200, headers: headersWith({}), body: '' });

  const arxiv = await checkOne('arxiv:2309.00071', handler);
  const doi = await checkOne('doi:10.1145/3530811', handler);
  const url = await checkOne('url:blog.eleuther.ai/yarn', handler);

  assert.equal(arxiv.calls[0].url, 'https://arxiv.org/abs/2309.00071');
  assert.equal(doi.calls[0].url, 'https://doi.org/10.1145/3530811');
  assert.equal(url.calls[0].url, 'https://blog.eleuther.ai/yarn');
});

test('T-23-14 BOUNDARY: a body at exactly MAX_BYTES is resolvable and one byte more is oversize', async () => {
  const atCap = 'a'.repeat(RESOLVE_LIMITS.MAX_BYTES);
  const overCap = 'a'.repeat(RESOLVE_LIMITS.MAX_BYTES + 1);

  const exact = await checkOne('url:example.com/at-cap', () => ({
    status: 200,
    headers: headersWith({}),
    body: atCap,
  }));
  const over = await checkOne('url:example.com/over-cap', () => ({
    status: 200,
    headers: headersWith({}),
    body: overCap,
  }));

  assert.equal(exact.record.outcome, RESOLVE_OUTCOMES.RESOLVABLE, 'exactly at the cap must still resolve');
  assert.equal(over.record.outcome, RESOLVE_OUTCOMES.OVERSIZE, 'one byte over the cap must be oversize, NOT resolvable');
});

test('T-23-14: reading STOPS at the cap -- a streamed body is not pulled past MAX_BYTES', async () => {
  let pulled = 0;
  const body = {
    async *[Symbol.asyncIterator]() {
      pulled += 1;
      yield new Uint8Array(RESOLVE_LIMITS.MAX_BYTES + 1);
      pulled += 1;
      throw new Error('the reader must never pull a chunk past the cap');
    },
  };

  const streamed = await checkOne('url:example.com/stream', () => ({ status: 200, headers: headersWith({}), body }));

  assert.equal(streamed.record.outcome, RESOLVE_OUTCOMES.OVERSIZE);
  assert.equal(pulled, 1, 'exactly one chunk was pulled; the body was abandoned at the cap');
});

test('T-23-05 BOUNDARY: exactly MAX_REDIRECT_HOPS hops resolve and a fourth is redirect-limit', async () => {
  const chain = (total) => (url) => {
    const hop = Number(new URL(url).searchParams.get('hop') || '0');

    if (hop < total) {
      return {
        status: 302,
        headers: headersWith({ location: 'https://example.com/r?hop=' + (hop + 1) }),
        body: '',
      };
    }

    return { status: 200, headers: headersWith({}), body: 'arrived' };
  };

  const three = await checkOne('url:example.com/r?hop=0', chain(3));
  const four = await checkOne('url:example.com/r?hop=0', chain(4));

  assert.equal(three.record.outcome, RESOLVE_OUTCOMES.RESOLVABLE, 'three hops are within the cap');
  assert.equal(three.calls.length, 4, 'three redirects plus the final request');
  assert.equal(four.record.outcome, RESOLVE_OUTCOMES.REDIRECT_LIMIT, 'a fourth hop must be redirect-limit');
  assert.equal(four.calls.length, 4, 'the FOURTH redirect target is never requested -- the chain stops at the cap');
  assert.equal(
    four.calls[3].url,
    'https://example.com/r?hop=3',
    'the last URL requested is the third redirect target, not the fourth',
  );
});

test('T-23-05: a non-http(s) identifier is scheme-blocked and the stub is NEVER invoked', async () => {
  for (const identifier of ['file:///etc/passwd', 'data:text/html,<script>1</script>', 'raw:see the appendix']) {
    const blocked = await checkOne(identifier, () => {
      throw new Error('the fetcher must never be reached for ' + identifier);
    });

    assert.equal(blocked.record.outcome, RESOLVE_OUTCOMES.SCHEME_BLOCKED);
    assert.equal(blocked.calls.length, 0, 'the scheme is checked BEFORE any request is made');
  }
});

test('T-23-05: a REDIRECT to a non-http scheme is scheme-blocked, and the stub is never called for that target', async () => {
  const { calls, fetchImpl } = loggingStub((url) => {
    if (url === 'https://example.com/start') {
      return { status: 302, headers: headersWith({ location: 'file:///etc/passwd' }), body: '' };
    }

    throw new Error('the fetcher must never be reached for ' + url);
  });

  const envelope = await checkResolvability({
    identifiers: ['url:example.com/start'],
    fetchImpl,
    now: FIXED_NOW,
    delay: NEVER,
  });

  assert.equal(envelope.records[0].outcome, RESOLVE_OUTCOMES.SCHEME_BLOCKED);
  assert.deepEqual(
    calls.map((call) => call.url),
    ['https://example.com/start'],
    'the scheme is RE-VALIDATED on every hop, so the blocked redirect target is never requested',
  );
});

test('T-23-05 BOUNDARY: a stub that settles resolves; one that never settles times out at the frozen TIMEOUT_MS', async () => {
  // Just under the deadline: the fetch settles while the deadline timer is still pending.
  const settled = await checkOne('url:example.com/fast', () => ({ status: 200, headers: headersWith({}), body: '' }));

  assert.equal(settled.record.outcome, RESOLVE_OUTCOMES.RESOLVABLE);

  // Never settles: the raced deadline wins. The deadline is injected so the frozen 10000 ms value can
  // be asserted without a ten-second test.
  const deadlines = [];
  const envelope = await checkResolvability({
    identifiers: ['url:example.com/hangs'],
    fetchImpl: () => new Promise(() => {}),
    now: FIXED_NOW,
    delay: (ms) => {
      deadlines.push(ms);

      return Promise.resolve();
    },
  });

  assert.equal(envelope.records[0].outcome, RESOLVE_OUTCOMES.TIMEOUT);
  assert.deepEqual(deadlines, [RESOLVE_LIMITS.TIMEOUT_MS], 'the deadline raced is the frozen 10000 ms');
});

test('ENV-04 live: a fetcher that throws is recorded network-error, not silently skipped', async () => {
  const { fetchImpl } = loggingStub(() => {
    throw new Error('ECONNREFUSED');
  });
  const envelope = await checkResolvability({
    identifiers: ['url:example.com/down'],
    fetchImpl,
    now: FIXED_NOW,
    delay: NEVER,
  });

  assert.equal(envelope.records[0].outcome, RESOLVE_OUTCOMES.NETWORK_ERROR);
});

test('T-23-05: no request carries credentials, cookies, an authorization header or a referrer', async () => {
  const sent = await checkOne('url:example.com/p', () => ({ status: 200, headers: headersWith({}), body: '' }));
  const init = sent.calls[0].init;

  assert.equal(init.credentials, 'omit');
  assert.equal(init.redirect, 'manual', 'redirects are handled manually so every hop can be re-validated');
  assert.equal(init.referrerPolicy, 'no-referrer');
  assert.equal(init.cache, 'no-store');
  assert.ok(init.signal, 'an abort signal is attached');

  const headerNames = Object.keys(init.headers || {}).map((name) => name.toLowerCase());

  assert.deepEqual(headerNames, [], 'no authorization and no cookie header is sent');
});

test('T-23-05: each record has EXACTLY the five allowed keys, so no response body can reach the output', async () => {
  const envelope = await checkResolvability({
    identifiers: ['url:example.com/a', 'file:///etc/passwd'],
    fetchImpl: () => Promise.resolve({ status: 200, headers: headersWith({}), body: 'SECRET BODY TEXT' }),
    now: FIXED_NOW,
    delay: NEVER,
  });

  for (const record of envelope.records) {
    assert.deepEqual(Object.keys(record).sort(), ['finalUrl', 'identifier', 'outcome', 'requestUrl', 'status']);
  }

  assert.doesNotMatch(JSON.stringify(envelope), /SECRET BODY TEXT/, 'the body is never returned or persisted');
});

test('D-12: the envelope carries checkedAt from the injected clock, so the check date travels with the result', async () => {
  const envelope = await checkResolvability({
    identifiers: ['url:example.com/a'],
    fetchImpl: () => Promise.resolve({ status: 200, headers: headersWith({}), body: '' }),
    now: FIXED_NOW,
    delay: NEVER,
  });

  assert.equal(envelope.checkedAt, '2026-09-07T12:00:00.000Z');
  assert.equal(envelope.limits, RESOLVE_LIMITS);
  assert.match(envelope.limitation, /never existed/, 'the named limitation travels into the ENV-04 record');
  assert.match(
    envelope.limitation,
    /NOT a source-quality measure/,
    'the ENV-04 transparency prohibition: resolvability must never be worded as source quality',
  );
});

test('ENV-04 live: a bad identifiers argument or a missing fetcher is a ContractError (fail-closed)', async () => {
  const fetchImpl = () => Promise.resolve({ status: 200, headers: headersWith({}), body: '' });

  await assert.rejects(() => checkResolvability({ identifiers: 'not-an-array', fetchImpl }), ContractError);
  await assert.rejects(() => checkResolvability({ fetchImpl }), ContractError);
  await assert.rejects(() => checkResolvability({ identifiers: ['url:example.com/a'] }), ContractError);
  await assert.rejects(() => checkResolvability({ identifiers: [''], fetchImpl }), ContractError);
  await assert.rejects(() => checkResolvability({ identifiers: ['   '], fetchImpl }), ContractError);
  await assert.rejects(() => checkResolvability({ identifiers: [42], fetchImpl }), ContractError);
  await assert.rejects(() => checkResolvability({ identifiers: [null], fetchImpl }), ContractError);
});
