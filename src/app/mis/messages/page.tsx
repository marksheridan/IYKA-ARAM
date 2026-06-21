import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { StatusBadge } from "@/components/mis/status-badge";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { dateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const configured = isWhatsAppConfigured();

  const messages = await prisma.messageLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl text-forest">Messages</h1>
      <p className="mt-1 text-sm text-muted">
        WhatsApp confirmations, receipts and enquiry acknowledgements.
      </p>

      <div
        className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
          configured
            ? "border-sage/40 bg-white text-forest"
            : "border-gold/40 bg-gold-soft/40 text-forest"
        }`}
      >
        {configured ? (
          <>WhatsApp is <strong>live</strong> — messages are being sent.</>
        ) : (
          <>
            WhatsApp is in <strong>simulated mode</strong>. Messages are logged
            here but not actually sent. Add a WhatsApp Business provider
            (set <code>WHATSAPP_API_KEY</code> &amp;{" "}
            <code>WHATSAPP_PHONE_NUMBER_ID</code>) to switch it on.
          </>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-sand bg-white">
        {messages.length === 0 ? (
          <p className="p-6 text-sm text-muted">No messages yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => {
                const body =
                  (m.payload as { body?: string } | null)?.body ?? "";
                return (
                  <tr key={m.id} className="border-t border-sand align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                      {dateTime(m.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-muted">
                      {m.type.replace(/_/g, " ").toLowerCase()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink">
                      {m.recipient}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-xs text-muted">
                      {body}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} />
                    </td>
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
