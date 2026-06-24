"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { destroySession } from "@/lib/session";
import { requireUser } from "@/lib/auth";
import { AppointmentStatus } from "@/generated/prisma/client";

const VALID_STATUSES = [
  "REQUESTED",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_CONSULTATION",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];
const VALID_TYPES = ["DOCTOR", "THERAPIST", "INSTRUCTOR", "NUTRITIONIST"];

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function setAppointmentStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !VALID_STATUSES.includes(status)) return;

  const appt = await prisma.appointment.findUnique({
    where: { id },
    select: { providerId: true },
  });
  if (!appt) return;
  if (user.role === "DOCTOR" && appt.providerId !== user.staffId) {
    redirect("/mis/appointments?error=forbidden");
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: status as AppointmentStatus },
  });
  revalidatePath("/mis/appointments");
  revalidatePath(`/mis/appointments/${id}`);
  revalidatePath("/mis");
}

export async function addConsultationNote(formData: FormData) {
  const user = await requireUser(["DOCTOR", "ADMIN"]);
  const appointmentId = String(formData.get("appointmentId") ?? "");
  const chiefComplaint = String(formData.get("chiefComplaint") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const advice = String(formData.get("advice") ?? "").trim();
  if (!appointmentId) return;

  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { patientId: true, providerId: true },
  });
  if (!appt) return;
  if (user.role === "DOCTOR" && appt.providerId !== user.staffId) {
    redirect("/mis/appointments?error=forbidden");
  }
  const doctorId = appt.providerId ?? user.staffId;
  if (!doctorId) return;

  await prisma.consultationNote.upsert({
    where: { appointmentId },
    update: {
      chiefComplaint: chiefComplaint || null,
      notes: notes || null,
      advice: advice || null,
    },
    create: {
      appointmentId,
      patientId: appt.patientId,
      doctorId,
      chiefComplaint: chiefComplaint || null,
      notes: notes || null,
      advice: advice || null,
    },
  });
  revalidatePath(`/mis/appointments/${appointmentId}`);
}

export async function createStaff(formData: FormData) {
  await requireUser(["ADMIN"]);
  const name = String(formData.get("name") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "DOCTOR");
  const specialtiesRaw = String(formData.get("specialties") ?? "").trim();
  if (!name) redirect("/mis/doctors?error=missing");

  const type = (VALID_TYPES.includes(typeRaw) ? typeRaw : "DOCTOR") as
    | "DOCTOR"
    | "THERAPIST"
    | "INSTRUCTOR"
    | "NUTRITIONIST";

  await prisma.staff.create({
    data: {
      name,
      type,
      specialties: specialtiesRaw
        ? specialtiesRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      isPublic: true,
    },
  });
  revalidatePath("/mis/doctors");
  redirect("/mis/doctors");
}
