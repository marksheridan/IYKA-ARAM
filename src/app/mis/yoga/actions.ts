"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EnrollmentStatus } from "@/generated/prisma/client";

const STAFF_ROLES = ["ADMIN", "FRONT_DESK"] as const;
const HORIZON_DAYS = 28;

async function findOrCreatePatient(name: string, phone: string, email: string) {
  const existing = await prisma.patient.findFirst({ where: { phone } });
  if (existing) return existing;
  return prisma.patient.create({
    data: { name, phone, email: email || null, consentWhatsApp: true },
  });
}

/** Create occurrences for the next HORIZON_DAYS from a schedule (or all active),
 *  skipping any that already exist. Returns nothing (revalidates). */
async function generateForSchedule(scheduleId: string) {
  const schedule = await prisma.classSchedule.findUnique({
    where: { id: scheduleId },
  });
  if (!schedule || !schedule.isActive) return;

  const [h, m] = schedule.startTime.split(":").map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < HORIZON_DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (!schedule.daysOfWeek.includes(d.getDay())) continue;
    if (schedule.validTo && d > schedule.validTo) continue;

    const startsAt = new Date(d);
    startsAt.setHours(h, m, 0, 0);

    const exists = await prisma.classOccurrence.findFirst({
      where: { scheduleId: schedule.id, startsAt },
      select: { id: true },
    });
    if (exists) continue;

    await prisma.classOccurrence.create({
      data: {
        scheduleId: schedule.id,
        instructorId: schedule.instructorId,
        title: schedule.title,
        startsAt,
        durationMin: schedule.durationMin,
        capacity: schedule.capacity,
        status: "SCHEDULED",
      },
    });
  }
}

export async function createClassSchedule(formData: FormData) {
  await requireUser([...STAFF_ROLES]);
  const serviceId = String(formData.get("serviceId") ?? "");
  const instructorId = String(formData.get("instructorId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "07:00");
  const durationMin = Number(formData.get("durationMin") ?? 60);
  const capacity = Number(formData.get("capacity") ?? 20);
  const days = formData.getAll("daysOfWeek").map((d) => Number(d));

  if (!serviceId || !instructorId || !title || days.length === 0) {
    redirect("/mis/yoga?error=missing");
  }

  const schedule = await prisma.classSchedule.create({
    data: {
      serviceId,
      instructorId,
      title,
      startTime,
      durationMin: Number.isFinite(durationMin) ? durationMin : 60,
      capacity: Number.isFinite(capacity) ? capacity : 20,
      daysOfWeek: days.filter((d) => d >= 0 && d <= 6),
      mode: "ONLINE",
    },
  });
  await generateForSchedule(schedule.id);
  revalidatePath("/mis/yoga");
  redirect("/mis/yoga");
}

export async function generateOccurrences(formData: FormData) {
  await requireUser([...STAFF_ROLES]);
  const scheduleId = String(formData.get("scheduleId") ?? "");
  if (scheduleId) {
    await generateForSchedule(scheduleId);
  } else {
    const schedules = await prisma.classSchedule.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    for (const s of schedules) await generateForSchedule(s.id);
  }
  revalidatePath("/mis/yoga");
}

export async function markAttendance(formData: FormData) {
  await requireUser([...STAFF_ROLES]);
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  const status = String(formData.get("status") ?? "");
  const occurrenceId = String(formData.get("occurrenceId") ?? "");
  const valid = ["BOOKED", "ATTENDED", "NO_SHOW"];
  if (!enrollmentId || !valid.includes(status)) return;
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status: status as EnrollmentStatus },
  });
  if (occurrenceId) revalidatePath(`/mis/yoga/${occurrenceId}`);
}

export async function addAttendee(formData: FormData) {
  await requireUser([...STAFF_ROLES]);
  const occurrenceId = String(formData.get("occurrenceId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!occurrenceId || !name || !phone) {
    redirect(`/mis/yoga/${occurrenceId}?error=missing`);
  }

  const occ = await prisma.classOccurrence.findUnique({
    where: { id: occurrenceId },
    include: { _count: { select: { enrollments: true } } },
  });
  if (!occ) redirect("/mis/yoga?error=notfound");
  if (occ._count.enrollments >= occ.capacity) {
    redirect(`/mis/yoga/${occurrenceId}?error=full`);
  }

  const patient = await findOrCreatePatient(name, phone, email);
  try {
    await prisma.enrollment.create({
      data: { patientId: patient.id, occurrenceId, status: "BOOKED" },
    });
  } catch {
    redirect(`/mis/yoga/${occurrenceId}?error=already`);
  }
  revalidatePath(`/mis/yoga/${occurrenceId}`);
}

export async function removeAttendee(formData: FormData) {
  await requireUser([...STAFF_ROLES]);
  const enrollmentId = String(formData.get("enrollmentId") ?? "");
  const occurrenceId = String(formData.get("occurrenceId") ?? "");
  if (!enrollmentId) return;
  await prisma.enrollment.delete({ where: { id: enrollmentId } });
  if (occurrenceId) revalidatePath(`/mis/yoga/${occurrenceId}`);
}

export async function updateOccurrence(formData: FormData) {
  await requireUser([...STAFF_ROLES]);
  const occurrenceId = String(formData.get("occurrenceId") ?? "");
  const meetingLink = String(formData.get("meetingLink") ?? "").trim();
  if (!occurrenceId) return;
  await prisma.classOccurrence.update({
    where: { id: occurrenceId },
    data: { meetingLink: meetingLink || null },
  });
  revalidatePath(`/mis/yoga/${occurrenceId}`);
}

export async function cancelOccurrence(formData: FormData) {
  await requireUser([...STAFF_ROLES]);
  const occurrenceId = String(formData.get("occurrenceId") ?? "");
  if (!occurrenceId) return;
  await prisma.classOccurrence.update({
    where: { id: occurrenceId },
    data: { status: "CANCELLED" },
  });
  revalidatePath(`/mis/yoga/${occurrenceId}`);
  revalidatePath("/mis/yoga");
}
