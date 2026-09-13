/**
 * Abuse controls for the public enquiry form.
 *
 * Phase 1 keeps the enquiry path off the database, so these counters live in
 * process memory. Be honest about what that buys: Vercel runs several instances
 * and recycles them, so a determined distributed flood can still get through.
 * What it reliably stops is the common case — one script hammering the form.
 * The honeypot and the timing floor do the heavier lifting against bots, and
 * they cost nothing to evaluate.
 *
 * If the clinic ever sees spam that beats this, the upgrade path is Cloudflare
 * Turnstile (still no database) rather than a bigger in-memory table.
 */

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

// Bound the map so a spray of unique IPs can't grow it without limit.
const MAX_KEYS = 5_000;

function take(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now > existing.resetAt) {
    if (buckets.size >= MAX_KEYS) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
      if (buckets.size >= MAX_KEYS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

const MINUTE = 60_000;

export type LimitVerdict = { ok: true } | { ok: false; reason: string };

/**
 * Layered limits. Per-phone is the one that answers "the same person keeps
 * submitting"; per-IP catches a script cycling fake numbers; the global cap is
 * a circuit breaker so the inbox can't be buried even if both are evaded.
 */
export function checkEnquiryLimits(opts: {
  ip: string;
  phone: string;
}): LimitVerdict {
  if (!take(`phone:${opts.phone}`, 2, 60 * MINUTE)) {
    return {
      ok: false,
      reason:
        "We've already received your enquiry — our team will call you shortly.",
    };
  }
  if (!take(`ip:${opts.ip}`, 3, 10 * MINUTE)) {
    return { ok: false, reason: "Too many enquiries just now. Please try again in a few minutes." };
  }
  if (!take(`ip-day:${opts.ip}`, 10, 24 * 60 * MINUTE)) {
    return { ok: false, reason: "Too many enquiries from this connection today. Please call us instead." };
  }
  if (!take("global", 40, 60 * MINUTE)) {
    return { ok: false, reason: "We're receiving an unusual number of enquiries. Please call us instead." };
  }
  return { ok: true };
}

/** Bots fill every field they find; this one is hidden from people. */
export const HONEYPOT_FIELD = "company_website";

/**
 * Milliseconds a human needs, at minimum, to read three fields and type into
 * them. Anything faster is a script posting straight at the action.
 */
export const MIN_FILL_MS = 3_000;
