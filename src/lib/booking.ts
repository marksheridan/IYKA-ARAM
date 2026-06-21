import { prisma } from "@/lib/db";
import { AppointmentStatus } from "@/generated/prisma/client";

export type Slot = { value: string; label: string };

/** Local YYYY-MM-DD (avoids UTC offset surprises from toISOString). */
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Next `count` days for the date picker. */
export function getUpcomingDays(count = 14): { value: string; label: string }[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return {
      value: toDateStr(d),
      label: d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    };
  });
}

function atTime(date: string, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(`${date}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Bookable start times for a provider on a date: derived from the provider's
 * weekly availability, minus existing appointments, time blocks and past times.
 */
export async function getAvailableSlots(opts: {
  providerId: string;
  serviceDurationMin: number;
  date: string; // YYYY-MM-DD
}): Promise<Slot[]> {
  const { providerId, serviceDurationMin, date } = opts;
  const day = new Date(`${date}T00:00:00`);
  if (Number.isNaN(day.getTime())) return [];

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const [rules, appts, blocks] = await Promise.all([
    prisma.availability.findMany({
      where: { staffId: providerId, dayOfWeek: day.getDay() },
    }),
    prisma.appointment.findMany({
      where: {
        providerId,
        startsAt: { gte: dayStart, lte: dayEnd },
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
      select: { startsAt: true, endsAt: true },
    }),
    prisma.timeBlock.findMany({
      where: { staffId: providerId, start: { lte: dayEnd }, end: { gte: dayStart } },
      select: { start: true, end: true },
    }),
  ]);

  const now = new Date();
  const stepMs = serviceDurationMin * 60_000;
  const slots: Slot[] = [];

  for (const rule of rules) {
    const open = atTime(date, rule.startTime).getTime();
    const close = atTime(date, rule.endTime).getTime();
    for (let t = open; t + stepMs <= close; t += stepMs) {
      const start = new Date(t);
      const end = new Date(t + stepMs);
      if (start <= now) continue;
      const clashAppt = appts.some((a) => start < a.endsAt && end > a.startsAt);
      const clashBlock = blocks.some((b) => start < b.end && end > b.start);
      if (clashAppt || clashBlock) continue;
      slots.push({ value: start.toISOString(), label: formatTime(start) });
    }
  }
  return slots;
}
