import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Demo data: ~1 month of activity so the MIS dashboard/reports look alive.
 * Idempotent — clears its own transactional tables first, then re-creates.
 * Run after `npm run db:seed` (it relies on the base services/schedule).
 */

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(arr: T[]): T => arr[rand(arr.length)];
const chance = (p: number) => Math.random() < p;

function atTime(day: Date, hour: number, minute: number) {
  const d = new Date(day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  // ── Clear transactional data (keep structure: staff, services, schedule) ──
  await prisma.payment.deleteMany({});
  await prisma.invoiceLineItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.consultationNote.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.patient.deleteMany({});

  // ── A few more providers (idempotent) ──
  const extraDocs = [
    { id: "stf-doc-banri", name: "Dr. Banri Lyngdoh", specialties: ["Internal Medicine"] },
    { id: "stf-doc-sheila", name: "Dr. Sheila Marak", specialties: ["Ayurveda"] },
  ];
  for (const d of extraDocs) {
    await prisma.staff.upsert({
      where: { id: d.id },
      update: { isActive: true },
      create: { id: d.id, name: d.name, type: "DOCTOR", specialties: d.specialties, isPublic: true },
    });
  }
  await prisma.staff.upsert({
    where: { id: "stf-nutritionist" },
    update: { isActive: true },
    create: { id: "stf-nutritionist", name: "Wanda Kharkongor", type: "NUTRITIONIST", specialties: ["Clinical Nutrition"], isPublic: true },
  });

  // Connect consultation service to all doctors + nutritionist (so they have work)
  await prisma.service.update({
    where: { id: "svc-consult" },
    data: {
      providers: {
        connect: [{ id: "stf-doctor" }, { id: "stf-doc-banri" }, { id: "stf-doc-sheila" }, { id: "stf-nutritionist" }],
      },
    },
  });

  const consultProviders = ["stf-doctor", "stf-doc-banri", "stf-doc-sheila", "stf-nutritionist"];
  const sessionProvider = "stf-therapist";

  // ── Patients ──
  const names = [
    "Aiborlang Kharsyntiew", "Banri Suchiang", "Daniel Lyngdoh", "Esther Marak",
    "Ferdinand Sangma", "Grace Dkhar", "Hima Nongrum", "Ibapyntngen Wahlang",
    "Jenny Momin", "Kyrshan Rynjah", "Larisa Kharbithai", "Michael Syiem",
    "Nisha Pohshna", "Ophelia War",
  ];
  const now = new Date();
  const patients: { id: string; name: string }[] = [];
  for (let i = 0; i < names.length; i++) {
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - rand(40));
    const p = await prisma.patient.create({
      data: {
        name: names[i],
        phone: `+9170${String(10000000 + rand(89999999))}`,
        email: chance(0.6) ? `${names[i].split(" ")[0].toLowerCase()}@example.com` : null,
        gender: pick(["Male", "Female"]),
        city: "Shillong",
        consentWhatsApp: true,
        createdAt,
      },
    });
    patients.push(p);
  }

  const services = {
    consult: { id: "svc-consult", price: 1500, dur: 45, name: "Functional Medicine Consultation" },
    session: { id: "svc-session", price: 1200, dur: 60, name: "Naturopathy Session" },
  };

  let invSeq = 1;
  const methods: ("CASH" | "UPI" | "CARD")[] = ["CASH", "UPI", "CARD"];

  async function createAppt(opts: {
    day: Date;
    status: "REQUESTED" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
  }) {
    const isConsult = chance(0.7);
    const svc = isConsult ? services.consult : services.session;
    const providerId = isConsult ? pick(consultProviders) : sessionProvider;
    const startsAt = atTime(opts.day, 9 + rand(8), chance(0.5) ? 0 : 30);
    const endsAt = new Date(startsAt.getTime() + svc.dur * 60000);
    const patient = pick(patients);

    const appt = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        serviceId: svc.id,
        providerId,
        startsAt,
        endsAt,
        mode: "OFFLINE",
        status: opts.status,
        source: pick(["WEBSITE", "WALK_IN", "PHONE"]),
      },
    });

    // Completed visits get an invoice (mostly paid; a few left outstanding)
    if (opts.status === "COMPLETED") {
      const outstanding = chance(0.18); // ~18% left unpaid for the "pending checkout" card
      const partial = !outstanding && chance(0.1);
      const status = outstanding ? "ISSUED" : partial ? "PARTIALLY_PAID" : "PAID";
      const inv = await prisma.invoice.create({
        data: {
          number: `INV-${String(invSeq++).padStart(4, "0")}`,
          patientId: patient.id,
          status,
          subtotal: svc.price,
          taxAmount: 0,
          discount: 0,
          total: svc.price,
          issuedAt: startsAt,
          lineItems: {
            create: { description: svc.name, quantity: 1, unitPrice: svc.price, taxRate: 0, amount: svc.price, serviceId: svc.id },
          },
        },
      });
      if (status === "PAID") {
        await prisma.payment.create({
          data: { invoiceId: inv.id, amount: svc.price, method: pick(methods), paidAt: startsAt },
        });
      } else if (status === "PARTIALLY_PAID") {
        await prisma.payment.create({
          data: { invoiceId: inv.id, amount: Math.round(svc.price / 2), method: pick(methods), paidAt: startsAt },
        });
      }
    }
  }

  // ── Past month: ~24 appointments ──
  let pastCompleted = 0;
  for (let i = 0; i < 24; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() - (1 + rand(29)));
    const r = Math.random();
    const status = r < 0.72 ? "COMPLETED" : r < 0.86 ? "NO_SHOW" : "CANCELLED";
    if (status === "COMPLETED") pastCompleted++;
    await createAppt({ day, status });
  }

  // ── Today: a live-looking queue ──
  const todayStatuses = ["CHECKED_IN", "CONFIRMED", "CONFIRMED", "REQUESTED", "COMPLETED"] as const;
  for (const status of todayStatuses) {
    await createAppt({ day: now, status });
  }

  // ── Next few days: confirmed bookings ──
  for (let i = 0; i < 4; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + 1 + rand(5));
    await createAppt({ day, status: "CONFIRMED" });
  }

  // ── Expenses across the past month ──
  const cats = await prisma.expenseCategory.findMany();
  const byName = (n: string) => cats.find((c) => c.name === n)?.id;
  const expenseRows = [
    { name: "Rent", amount: 25000, vendor: "Shillong Properties" },
    { name: "Salaries", amount: 48000, vendor: "Payroll" },
    { name: "Supplies", amount: 6500, vendor: "MedSupply Co" },
    { name: "Utilities", amount: 3200, vendor: "MeECL" },
    { name: "Marketing", amount: 8000, vendor: "Local Ads" },
    { name: "Supplies", amount: 4100, vendor: "Herbal Stores" },
  ];
  for (const e of expenseRows) {
    const categoryId = byName(e.name);
    if (!categoryId) continue;
    const date = new Date(now);
    date.setDate(now.getDate() - rand(28));
    await prisma.expense.create({ data: { categoryId, amount: e.amount, date, vendor: e.vendor } });
  }

  // ── Yoga: a few past sessions (attended) + upcoming enrollments ──
  let yogaSessions = 0;
  // past completed occurrences with attendance
  for (let w = 1; w <= 4; w++) {
    const day = new Date(now);
    day.setDate(now.getDate() - w * 3);
    const startsAt = atTime(day, 7, 0);
    const occ = await prisma.classOccurrence.create({
      data: {
        scheduleId: "cls-morning-yoga",
        instructorId: "stf-instructor",
        title: "Morning Hatha Yoga",
        startsAt,
        durationMin: 60,
        capacity: 20,
        status: "COMPLETED",
        meetingLink: "https://meet.example.com/iyka-yoga",
      },
    });
    yogaSessions++;
    const attendees = patients.slice(0, 4 + rand(6));
    for (const p of attendees) {
      await prisma.enrollment.create({
        data: { patientId: p.id, occurrenceId: occ.id, status: chance(0.85) ? "ATTENDED" : "NO_SHOW" },
      });
    }
  }
  // enroll into the soonest upcoming occurrences
  const upcoming = await prisma.classOccurrence.findMany({
    where: { startsAt: { gte: now }, status: "SCHEDULED" },
    orderBy: { startsAt: "asc" },
    take: 2,
  });
  for (const occ of upcoming) {
    const bookers = patients.slice(0, 5 + rand(5));
    for (const p of bookers) {
      await prisma.enrollment.upsert({
        where: { patientId_occurrenceId: { patientId: p.id, occurrenceId: occ.id } },
        update: {},
        create: { patientId: p.id, occurrenceId: occ.id, status: "BOOKED" },
      });
    }
    yogaSessions++;
  }

  console.log("Demo data seeded:");
  console.log(`  patients: ${patients.length}`);
  console.log(`  appointments: ${24 + todayStatuses.length + 4} (past completed: ${pastCompleted})`);
  console.log(`  invoices created (seq): ${invSeq - 1}`);
  console.log(`  yoga sessions touched: ${yogaSessions}`);
  console.log(`  providers: 3 doctors + 1 therapist + 1 nutritionist + 1 instructor`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
