import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Seeds sample services, providers, availability and yoga classes so the
 * booking flow works before the MIS admin UI (Phase 3) exists.
 * Idempotent — safe to re-run (uses fixed ids + upserts).
 */
async function main() {
  // ── Providers ──────────────────────────────────────────────
  const doctor = await prisma.staff.upsert({
    where: { id: "stf-doctor" },
    update: {},
    create: {
      id: "stf-doctor",
      name: "Dr. A. Sharma",
      type: "DOCTOR",
      specialties: ["Functional Medicine"],
      bio: "Functional medicine physician focused on root-cause care.",
      isPublic: true,
    },
  });
  const therapist = await prisma.staff.upsert({
    where: { id: "stf-therapist" },
    update: {},
    create: {
      id: "stf-therapist",
      name: "R. Nongrum",
      type: "THERAPIST",
      specialties: ["Naturopathy"],
      isPublic: true,
    },
  });
  const instructor = await prisma.staff.upsert({
    where: { id: "stf-instructor" },
    update: {},
    create: {
      id: "stf-instructor",
      name: "Maya Iyer",
      type: "INSTRUCTOR",
      specialties: ["Hatha Yoga"],
      isPublic: true,
    },
  });

  // ── Services ───────────────────────────────────────────────
  await prisma.service.upsert({
    where: { id: "svc-consult" },
    update: {},
    create: {
      id: "svc-consult",
      name: "Functional Medicine Consultation",
      type: "CONSULTATION",
      mode: "BOTH",
      durationMin: 45,
      price: 1500,
      requiresProvider: true,
      description: "Root-cause consultation with our doctor.",
      providers: { connect: [{ id: doctor.id }] },
    },
  });
  await prisma.service.upsert({
    where: { id: "svc-session" },
    update: {},
    create: {
      id: "svc-session",
      name: "Naturopathy Session",
      type: "OFFLINE_SESSION",
      mode: "OFFLINE",
      durationMin: 60,
      price: 1200,
      requiresProvider: true,
      description: "In-person naturopathy & therapy session at the centre.",
      providers: { connect: [{ id: therapist.id }] },
    },
  });
  await prisma.service.upsert({
    where: { id: "svc-yoga" },
    update: {},
    create: {
      id: "svc-yoga",
      name: "Online Yoga Class",
      type: "YOGA_CLASS",
      mode: "ONLINE",
      durationMin: 60,
      price: 500,
      requiresProvider: true,
      description: "Live, instructor-led group yoga.",
      providers: { connect: [{ id: instructor.id }] },
    },
  });

  // ── Availability: Mon–Sat 09:00–17:00 for doctor & therapist ──
  for (const staffId of [doctor.id, therapist.id]) {
    await prisma.availability.deleteMany({ where: { staffId } });
    await prisma.availability.createMany({
      data: [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
        staffId,
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
      })),
    });
  }

  // ── Yoga: recurring schedule + concrete occurrences ──────────
  await prisma.classSchedule.upsert({
    where: { id: "cls-morning-yoga" },
    update: {},
    create: {
      id: "cls-morning-yoga",
      serviceId: "svc-yoga",
      instructorId: instructor.id,
      title: "Morning Hatha Yoga",
      daysOfWeek: [1, 3, 5],
      startTime: "07:00",
      durationMin: 60,
      capacity: 20,
      mode: "ONLINE",
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let created = 0;
  for (let i = 0; i < 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (![1, 3, 5].includes(d.getDay())) continue;
    const startsAt = new Date(d);
    startsAt.setHours(7, 0, 0, 0);
    const id = `occ-${d.toISOString().slice(0, 10)}`;
    await prisma.classOccurrence.upsert({
      where: { id },
      update: {},
      create: {
        id,
        scheduleId: "cls-morning-yoga",
        instructorId: instructor.id,
        title: "Morning Hatha Yoga",
        startsAt,
        durationMin: 60,
        capacity: 20,
        status: "SCHEDULED",
        meetingLink: "https://meet.example.com/iyka-yoga",
      },
    });
    created++;
  }

  // ── Expense categories (for the finance module) ─────────────
  for (const name of [
    "Rent",
    "Salaries",
    "Supplies",
    "Utilities",
    "Marketing",
    "Other",
  ]) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // ── MIS login users (dev credentials) ───────────────────────
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const doctorHash = await bcrypt.hash("Doctor@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@iyka-aram.com" },
    update: {},
    create: {
      email: "admin@iyka-aram.com",
      name: "Front Desk Admin",
      role: "ADMIN",
      passwordHash: adminHash,
    },
  });
  await prisma.user.upsert({
    where: { email: "doctor@iyka-aram.com" },
    update: {},
    create: {
      email: "doctor@iyka-aram.com",
      name: "Dr. A. Sharma",
      role: "DOCTOR",
      passwordHash: doctorHash,
      staffId: "stf-doctor",
    },
  });

  console.log(`Seed complete. Yoga occurrences ensured: ${created}`);
  console.log("MIS logins:");
  console.log("  admin@iyka-aram.com / Admin@123   (Admin/front-desk)");
  console.log("  doctor@iyka-aram.com / Doctor@123 (Doctor)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
