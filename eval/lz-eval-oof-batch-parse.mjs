// lz-eval-oof-batch-parse.mjs
//
// NET-NEW (RE-PLAN-8, NO-SPEND): the REUSED score.mjs slice + byId extraction, ported byte-faithfully
// so the batched adapter (lz-eval-oof-batch.mjs) does NOT carry score.mjs's hardcoded 6-case ground
// truth or its static c1-c6 ITEMS. SOURCE OF TRUTH: eval/.cache/oof-probe/score.mjs (DP2). This is
// the EXACT slice logic from score.mjs lines 14-40:
//   - fence-strip: match a ```...``` (optionally ```json) fence and take its body, else the raw text;
//   - first-`[` / last-`]` slice of the body, JSON.parse;
//   - the byId { id -> entails } extraction: lowercased trimmed id; entails truthiness via
//     (o.entails === true || String(o.entails).toLowerCase() === 'true').
//
// This module REUSES ONLY the slice + byId; it intentionally does NOT carry the GT/TRUE_IDS/FALSE_IDS
// scoring (that is score.mjs's capability-probe-specific logic). The adapter renders its OWN per-item
// EVIDENCE+CLAIM block from real packets and de-maps the opaque ids itself.
//
// Strictly ASCII, no BOM (per CLAUDE.md).
//
// DP3 hardening over the bare score.mjs slice: score.mjs's byId coerces ANY non-'true' value to
// false (a capability-probe convenience). For the GATING adapter that is unsafe -- a non-boolean
// entails must FAIL CLOSED to a DROP, not be silently coerced to false (which could fabricate a
// retain on a refuted-gold trap). So sliceByIdEntails preserves a non-boolean entails as the literal
// (non-true/false) value, and the adapter treats anything not strictly true/false as a per-packet
// defect (DP3). A genuine boolean true/false (or the string 'true'/'false') maps to the boolean.

// Returns { ok, byId } where:
//   ok=false  -> a WHOLE-BATCH parse failure (no sliceable JSON array). byId={}.
//   ok=true   -> byId maps lowercased-trimmed id -> entails value: boolean true/false when the
//                response gave a boolean or the string 'true'/'false'; otherwise the RAW value
//                (so the adapter can fail-closed-to-DROP on a non-boolean entails, DP3). A
//                batch-level summary object (not an array) is a WHOLE-BATCH failure (ok=false).
export function sliceByIdEntails(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, byId: {} };
  }

  // Fence-strip (score.mjs line 14): take the fenced body if a fence exists, else the raw text.
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : raw;

  // First-`[` / last-`]` slice (score.mjs lines 16-18).
  const start = body.indexOf('[');
  const end = body.lastIndexOf(']');
  let arr = null;

  if (start >= 0 && end > start) {
    try {
      arr = JSON.parse(body.slice(start, end + 1));
    } catch (e) {
      void e;

      return { ok: false, byId: {} };
    }
  }

  // A batch-level summary (not an array) is a WHOLE-BATCH failure (DP3).
  if (!Array.isArray(arr)) {
    return { ok: false, byId: {} };
  }

  // byId extraction (score.mjs lines 35-40), DP3-hardened to PRESERVE a non-boolean entails so the
  // adapter can fail-closed-to-DROP rather than silently coerce to false.
  const byId = {};

  for (const o of arr) {
    if (!o || typeof o !== 'object') {
      continue;
    }

    const id = String(o.id == null ? '' : o.id).toLowerCase().trim();

    if (id.length === 0) {
      continue;
    }

    const v = o.entails;
    let entails;

    if (v === true || (typeof v === 'string' && v.toLowerCase() === 'true')) {
      entails = true;
    } else if (v === false || (typeof v === 'string' && v.toLowerCase() === 'false')) {
      entails = false;
    } else {
      // Non-boolean (number, null, missing, arbitrary string) -> preserve RAW so the adapter drops
      // the packet (DP3 fail-closed-to-DROP). NEVER coerce to false (could fabricate a retain).
      entails = v === undefined ? '__missing__' : v;
    }

    // DUPLICATE id detection: a second occurrence overwrites with a sentinel the adapter treats as a
    // defect. (The adapter ALSO tracks duplicate opaque ids per-batch; this is defense-in-depth.)
    if (Object.prototype.hasOwnProperty.call(byId, id)) {
      byId[id] = '__duplicate__';
      continue;
    }

    byId[id] = entails;
  }

  return { ok: true, byId };
}
