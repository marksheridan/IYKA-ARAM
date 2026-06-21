const STYLES: Record<string, string> = {
  REQUESTED: "bg-sand text-muted",
  CONFIRMED: "bg-gold-soft text-forest",
  CHECKED_IN: "bg-sage/30 text-forest",
  COMPLETED: "bg-forest text-cream",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-red-100 text-red-700",
  RESCHEDULED: "bg-sand text-muted",
  // invoice / enrollment / payout states
  DRAFT: "bg-sand text-muted",
  ISSUED: "bg-gold-soft text-forest",
  PAID: "bg-forest text-cream",
  PARTIALLY_PAID: "bg-gold-soft text-forest",
  REFUNDED: "bg-red-100 text-red-700",
  BOOKED: "bg-gold-soft text-forest",
  ATTENDED: "bg-forest text-cream",
  PENDING: "bg-sand text-muted",
  // message delivery states
  QUEUED: "bg-sand text-muted",
  SENT: "bg-gold-soft text-forest",
  DELIVERED: "bg-sage/30 text-forest",
  READ: "bg-forest text-cream",
  FAILED: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        STYLES[status] ?? "bg-sand text-muted"
      }`}
    >
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
