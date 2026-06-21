"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AppointmentStatus } from "@/generated/prisma/client";
import {
  notify,
  bookingConfirmationBody,
  classConfirmationBody,
} from "@/lib/whatsapp";

type Result = { ok: true; id: string } | { ok: false; error: string };

async function findOrCreatePatient(name: string, phone: string, email: string) {
  const existing = await prisma.patient.findFirst({ where: { phone } });
  if (existing) return existing;
  return prisma.patient.create({
    data: {
      name,
      phone,
      email: email || null,
      consentWhatsApp: true,
      consentDataHandling: true,
    },
  });
}

/** Slot booking — consultations & offline sessions. */
export async function bookAppointment(formData: FormData) {
  const serviceId = String(formData.get("serviceId") ?? "");
  const providerId = String(formData.get("providerId") ?? "");
  const startsAtIso = String(formData.get("startsAt") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  const backTo = `/booking/appointment?serviceId=${serviceId}&providerId=${providerId}&date=${startsAtIso.slice(0, 10)}`;

  if (!serviceId || !providerId || !startsAtIso || !name || !phone) {
    redirect(`${backTo}&error=missing`);
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) redirect(`/booking?error=service`);

  const startsAt = new Date(startsAtIso);
  const endsAt = new Date(startsAt.getTime() + service.durationMin * 60_000);

  let result: Result;
  try {
    const clash = await prisma.appointment.findFirst({
      where: {
        providerId,
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { id: true },
    });
    if (clash) {
      result = { ok: false, error: "taken" };
    } else {
      const patient = await findOrCreatePatient(name, phone, email);
      const appt = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          serviceId,
          providerId,
          startsAt,
          endsAt,
          mode: service.mode === "ONLINE" ? "ONLINE" : "OFFLINE",
          status: "CONFIRMED",
          source: "WEBSITE",
          reason: reason || null,
        },
      });
      await notify({
        to: phone,
        type: "BOOKING_CONFIRMATION",
        templateName: "booking_confirmation",
        body: bookingConfirmationBody({
          name,
          service: service.name,
          when: startsAt,
        }),
        patientId: patient.id,
        appointmentId: appt.id,
      });
      result = { ok: true, id: appt.id };
    }
  } catch (err) {
    console.error("bookAppointment failed:", err);
    result = { ok: false, error: "server" };
  }

  if (!result.ok) redirect(`${backTo}&error=${result.error}`);
  redirect(`/booking/confirmed?type=appointment&id=${result.id}`);
}

/** Seat booking — yoga class occurrences. */
export async function bookClass(formData: FormData) {
  const occurrenceId = String(formData.get("occurrenceId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!occurrenceId || !name || !phone) {
    redirect(`/booking/class?error=missing`);
  }

  let result: Result;
  try {
    const occ = await prisma.classOccurrence.findUnique({
      where: { id: occurrenceId },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!occ) {
      result = { ok: false, error: "notfound" };
    } else if (occ._count.enrollments >= occ.capacity) {
      result = { ok: false, error: "full" };
    } else {
      const patient = await findOrCreatePatient(name, phone, email);
      try {
        const enr = await prisma.enrollment.create({
          data: { patientId: patient.id, occurrenceId, status: "BOOKED" },
        });
        await notify({
          to: phone,
          type: "CLASS_ENROLLMENT",
          templateName: "class_enrollment_confirmation",
          body: classConfirmationBody({
            name,
            title: occ.title,
            when: occ.startsAt,
            link: occ.meetingLink,
          }),
          patientId: patient.id,
        });
        result = { ok: true, id: enr.id };
      } catch {
        // unique (patient, occurrence) violation → already enrolled
        result = { ok: false, error: "already" };
      }
    }
  } catch (err) {
    console.error("bookClass failed:", err);
    result = { ok: false, error: "server" };
  }

  if (!result.ok) redirect(`/booking/class?error=${result.error}`);
  redirect(`/booking/confirmed?type=class&id=${result.id}`);
}
