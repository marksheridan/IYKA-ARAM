/**
 * Order-status colour system for the admin backoffice.
 * One source of truth, built on the brand tokens — replaces the
 * per-page hardcoded hex maps.
 */
export const STATUS_TINTS: Record<string, { pill: string; dot: string }> = {
  PLACED:     { pill: "bg-mis-info-bg text-mis-info",            dot: "bg-mis-info" },
  CONFIRMED:  { pill: "bg-mis-success-bg text-mis-success",      dot: "bg-mis-success" },
  DISPATCHED: { pill: "bg-mis-warning-bg text-mis-warning-deep", dot: "bg-mis-warning" },
  DELIVERED:  { pill: "bg-mis-blue-light text-mis-blue",         dot: "bg-mis-blue" },
  CANCELLED:  { pill: "bg-mis-danger-bg text-mis-danger",        dot: "bg-mis-danger" },
};

const FALLBACK = { pill: "bg-mis-border-soft text-mis-text-muted", dot: "bg-mis-text-soft" };

export function StatusBadge({ status }: { status: string }) {
  const tint = STATUS_TINTS[status] ?? FALLBACK;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tint.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tint.dot}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
