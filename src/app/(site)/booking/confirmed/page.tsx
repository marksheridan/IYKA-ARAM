import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Booking Confirmed" };
export const dynamic = "force-dynamic";

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

function formatWhen(d: Date) {
  return d.toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const type = typeof sp.type === "string" ? sp.type : "";
  const id = typeof sp.id === "string" ? sp.id : "";

  let title = "";
  let when: Date | null = null;
  let who = "";
  let patient = "";

  if (type === "appointment" && id) {
    const a = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true, provider: true, patient: true },
    });
    if (a) {
      title = a.service.name;
      when = a.startsAt;
      who = a.provider?.name ?? "";
      patient = a.patient.name;
    }
  } else if (type === "class" && id) {
    const e = await prisma.enrollment.findUnique({
      where: { id },
      include: { occurrence: { include: { instructor: true } }, patient: true },
    });
    if (e) {
      title = e.occurrence.title;
      when = e.occurrence.startsAt;
      who = e.occurrence.instructor.name;
      patient = e.patient.name;
    }
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft font-display text-3xl text-forest">
        ✓
      </div>
      <h1 className="mt-6 font-display text-3xl text-forest">
        You&apos;re booked{patient ? `, ${patient.split(" ")[0]}` : ""}!
      </h1>

      {when ? (
        <div className="mt-6 rounded-2xl border border-sand bg-white p-6 text-left">
          <Row label="Booking" value={title} />
          <Row label="When" value={formatWhen(when)} />
          {who && <Row label="With" value={who} />}
        </div>
      ) : (
        <p className="mt-4 text-muted">Your booking is confirmed.</p>
      )}

      <p className="mt-6 text-sm text-muted">
        A confirmation will be sent to your WhatsApp once messaging goes live.
        We look forward to welcoming you.
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-full border border-sage px-6 py-2.5 text-sm text-forest transition-colors hover:bg-sand"
        >
          Back to home
        </Link>
        <Link
          href="/booking"
          className="rounded-full bg-forest px-6 py-2.5 text-sm text-cream transition-colors hover:bg-ink"
        >
          Book another
        </Link>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-sand py-2 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}
