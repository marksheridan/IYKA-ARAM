"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppointmentStatus } from "@/generated/prisma/client";
import { notify, bookingConfirmationBody } from "@/lib/whatsapp";

function localDateTime(date: string, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(`${date}T00:00:00`);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

/** Quick-register a patient (phone-first), then continue the booking flow. */
export async function quickRegisterPatient(formData: FormData) {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const carry = String(formData.get("carry") ?? ""); // extra query (serviceId/providerId/date)

  if (!name || phone.replace(/\D/g, "").length < 7) {
    redirect(`/mis/appointments/new?phone=${encodeURIComponent(phone)}&error=details`);
  }

  const existing = await prisma.patient.findFirst({ where: { phone } });
  const patient =
    existing ??
    (await prisma.patient.create({
      data: {
        name,
        phone,
        gender: gender || null,
        email: email || null,
        consentDataHandling: true,
      },
    }));

  redirect(`/mis/appointments/new?patientId=${patient.id}${carry ? `&${carry}` : ""}`);
}

/** Create an appointment for a selected patient + provider + slot. */
export async function createAppointmentStaff(formData: FormData) {
  await requireUser(["ADMIN", "FRONT_DESK", "DOCTOR"]);
  const patientId = String(formData.get("patientId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const providerId = String(formData.get("providerId") ?? "");
  const startsAtIso = String(formData.get("startsAt") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const back = `/mis/appointments/new?patientId=${patientId}&serviceId=${serviceId}&providerId=${providerId}&date=${startsAtIso.slice(0, 10)}`;
  if (!patientId || !serviceId || !providerId || !startsAtIso) {
    redirect(`${back}&error=missing`);
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) redirect(`${back}&error=service`);

  const startsAt = new Date(startsAtIso);
  const endsAt = new Date(startsAt.getTime() + service!.durationMin * 60_000);

  // Double-booking guard.
  const clash = await prisma.appointment.findFirst({
    where: {
      providerId,
      status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
    select: { id: true },
  });
  if (clash) redirect(`${back}&error=taken`);

  const appt = await prisma.appointment.create({
    data: {
      patientId,
      serviceId,
      providerId,
      startsAt,
      endsAt,
      mode: service!.mode === "ONLINE" ? "ONLINE" : "OFFLINE",
      status: "CONFIRMED",
      source: "WALK_IN",
      reason: reason || null,
    },
  });

  const patient = await prisma.patient.findUnique({ where: { id: patientId }, select: { name: true, phone: true } });
  if (patient) {
    await notify({
      to: patient.phone,
      type: "BOOKING_CONFIRMATION",
      templateName: "booking_confirmation",
      body: bookingConfirmationBody({ name: patient.name, service: service!.name, when: startsAt }),
      patientId,
      appointmentId: appt.id,
    });
  }

  revalidatePath("/mis/appointments");
  revalidatePath("/mis");
  redirect(`/mis/appointments/${appt.id}`);
}

/** Reschedule an existing appointment to a new slot. */
export async function rescheduleAppointment(formData: FormData) {
  await requireUser(["ADMIN", "FRONT_DESK", "DOCTOR"]);
  const id = String(formData.get("id") ?? "");
  const startsAtIso = String(formData.get("startsAt") ?? "");
  if (!id || !startsAtIso) redirect(`/mis/appointments/${id}?error=missing`);

  const appt = await prisma.appointment.findUnique({ where: { id }, include: { service: true } });
  if (!appt) redirect("/mis/appointments");

  const startsAt = new Date(startsAtIso);
  const endsAt = new Date(startsAt.getTime() + appt!.service.durationMin * 60_000);

  const clash = await prisma.appointment.findFirst({
    where: {
      id: { not: id },
      providerId: appt!.providerId,
      status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
    select: { id: true },
  });
  if (clash) redirect(`/mis/appointments/${id}?error=taken`);

  await prisma.appointment.update({ where: { id }, data: { startsAt, endsAt, status: "CONFIRMED" } });
  revalidatePath(`/mis/appointments/${id}`);
  revalidatePath("/mis/appointments");
  redirect(`/mis/appointments/${id}`);
}

/** Create a time-block (leave / meeting / emergency) for a provider. */
export async function createTimeBlock(formData: FormData) {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const staffId = String(formData.get("staffId") ?? "");
  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!staffId || !date || !startTime || !endTime) redirect("/mis/appointments/blocks?error=missing");
  const start = localDateTime(date, startTime);
  const end = localDateTime(date, endTime);
  if (end <= start) redirect("/mis/appointments/blocks?error=range");

  await prisma.timeBlock.create({ data: { staffId, start, end, reason: reason || null } });
  revalidatePath("/mis/appointments/blocks");
  redirect("/mis/appointments/blocks");
}

export async function deleteTimeBlock(formData: FormData) {
  await requireUser(["ADMIN", "FRONT_DESK"]);
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.timeBlock.delete({ where: { id } });
  revalidatePath("/mis/appointments/blocks");
  redirect("/mis/appointments/blocks");
}
