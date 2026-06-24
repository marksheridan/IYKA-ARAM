import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { dateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages · IYKA MIS" };

export default async function MessagesPage() {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const configured = isWhatsAppConfigured();

  const messages = await prisma.messageLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-mis-text)", letterSpacing: "-0.02em" }}>
          Messages
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--color-mis-text-muted)" }}>
          WhatsApp confirmations, receipts and enquiry acknowledgements.
        </p>
      </div>

      <div
        className="rounded-xl px-4 py-3 text-sm font-medium"
        style={configured
          ? { background: "var(--color-mis-success-bg)", color: "var(--color-mis-success)" }
          : { background: "var(--color-mis-warning-bg)", color: "var(--color-mis-warning)" }
        }
      >
        {configured ? (
          <>WhatsApp is <strong>live</strong> — messages are being sent.</>
        ) : (
          <>WhatsApp is in <strong>simulated mode</strong>. Messages are logged here but not sent. Set <code className="rounded bg-black/10 px-1">WHATSAPP_API_KEY</code> &amp; <code className="rounded bg-black/10 px-1">WHATSAPP_PHONE_NUMBER_ID</code> to enable.</>
        )}
      </div>

      <div className="mis-card overflow-x-auto">
        {messages.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: "var(--color-mis-text-muted)" }}>No messages yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-mis-border-soft)", background: "var(--color-mis-bg)" }}>
                {["When", "Type", "To", "Message", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-mis-text-soft)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {messages.map((m, idx) => {
                const body = (m.payload as { body?: string } | null)?.body ?? "";
                return (
                  <tr
                    key={m.id}
                    className="align-top transition-colors hover:bg-[var(--color-mis-bg)]"
                    style={{ borderTop: idx === 0 ? undefined : `1px solid var(--color-mis-border-soft)` }}
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs tabular-nums" style={{ color: "var(--color-mis-text-muted)" }}>{dateTime(m.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 capitalize" style={{ color: "var(--color-mis-text-muted)" }}>{m.type.replace(/_/g, " ").toLowerCase()}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 tabular-nums font-medium" style={{ color: "var(--color-mis-text)" }}>{m.recipient}</td>
                    <td className="max-w-xs px-4 py-3.5 text-xs" style={{ color: "var(--color-mis-text-muted)" }}>{body}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={m.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
