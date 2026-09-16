/**
 * Field names and thresholds shared by the enquiry form and the server action.
 *
 * Kept apart from rate-limit.ts so the client component that renders the hidden
 * fields never pulls the server-only limiter (and its crypto import) into the
 * browser bundle.
 */

/** Bots fill every field they find; this one is hidden from people. */
export const HONEYPOT_FIELD = "company_website";

/**
 * Milliseconds a human needs, at minimum, to read three fields and type into
 * them. Anything faster is a script posting straight at the action.
 */
export const MIN_FILL_MS = 3_000;
