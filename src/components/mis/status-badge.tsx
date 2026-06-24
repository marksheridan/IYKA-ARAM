type BadgeStyle = { bg: string; color: string };

const STYLES: Record<string, BadgeStyle> = {
  /* appointment */
  REQUESTED:       { bg: "var(--color-mis-blue-subtle)",   color: "var(--color-mis-blue)" },
  CONFIRMED:       { bg: "var(--color-mis-success-bg)",    color: "var(--color-mis-success)" },
  CHECKED_IN:      { bg: "var(--color-mis-info-bg)",       color: "var(--color-mis-info)" },
  COMPLETED:       { bg: "var(--color-mis-success-bg)",    color: "var(--color-mis-success)" },
  CANCELLED:       { bg: "var(--color-mis-danger-bg)",     color: "var(--color-mis-danger)" },
  NO_SHOW:         { bg: "var(--color-mis-danger-bg)",     color: "var(--color-mis-danger)" },
  RESCHEDULED:     { bg: "var(--color-mis-warning-bg)",    color: "var(--color-mis-warning)" },
  /* invoice */
  DRAFT:           { bg: "#f3f4f6",                        color: "#6b7280" },
  ISSUED:          { bg: "var(--color-mis-warning-bg)",    color: "var(--color-mis-warning)" },
  PAID:            { bg: "var(--color-mis-success-bg)",    color: "var(--color-mis-success)" },
  PARTIALLY_PAID:  { bg: "var(--color-mis-warning-bg)",    color: "var(--color-mis-warning)" },
  REFUNDED:        { bg: "var(--color-mis-danger-bg)",     color: "var(--color-mis-danger)" },
  /* enrollment */
  BOOKED:          { bg: "var(--color-mis-blue-light)",    color: "var(--color-mis-blue)" },
  ATTENDED:        { bg: "var(--color-mis-success-bg)",    color: "var(--color-mis-success)" },
  PENDING:         { bg: "var(--color-mis-warning-bg)",    color: "var(--color-mis-warning)" },
  /* message delivery */
  QUEUED:          { bg: "#f3f4f6",                        color: "#6b7280" },
  SENT:            { bg: "var(--color-mis-blue-subtle)",   color: "var(--color-mis-blue)" },
  DELIVERED:       { bg: "var(--color-mis-info-bg)",       color: "var(--color-mis-info)" },
  READ:            { bg: "var(--color-mis-success-bg)",    color: "var(--color-mis-success)" },
  FAILED:          { bg: "var(--color-mis-danger-bg)",     color: "var(--color-mis-danger)" },
  /* payout */
  UPLOADED:        { bg: "var(--color-mis-purple-bg)",     color: "var(--color-mis-purple)" },
};

const FALLBACK: BadgeStyle = { bg: "#f3f4f6", color: "#6b7280" };

export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? FALLBACK;
  return (
    <span
      className="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize leading-none"
      style={{ background: s.bg, color: s.color }}
    >
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
