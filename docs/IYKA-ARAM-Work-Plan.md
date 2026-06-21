# IYKA-ARAM Wellness — Web Platform Work Plan

> **Tagline:** *Wellness Starts Here.* Clinical wellness in Northeast India — Functional Medicine, Yoga & Naturopathy. Drugless, integrative, premium.
> **Location:** Meghalaya, Northeast India
> **Document purpose:** Lock the *logic and functionality* of every module **before** any code is written, and define the build approach and delivery sequence.
> **Status:** Draft v2 for client review — _2026-06-19_
> **Changes in v2:** Added a dedicated **Finance** area and a **Dashboard / analytics hub** to the MIS; added a **UI/UX & Design** section (dashboard + landing page); **WhatsApp integration moved to the final phase**.

---

## 0. How to read this document

This is the **design + work plan**, not the build. It answers three things for each of the three modules:

1. **What it does** (functionality)
2. **How it behaves** (logic, rules, states)
3. **What data it needs** (entities)

It also defines the **technology recommendation**, **UI/UX direction**, the **WhatsApp billing** approach, **compliance** notes, and a **phased delivery sequence**. Nothing here requires you to write or read code. At the end is a short list of decisions still open.

---

## 1. The product in one picture

IYKA-ARAM is **one platform with two faces**:

| Face | Who uses it | The three modules |
|------|-------------|-------------------|
| **Public website** | Patients, leads, the public | **1. Landing Page** + **2. Booking** |
| **Internal back-office** | Front-desk/Admin + Doctors | **3. MIS** (appointments, yoga sessions, doctors, **finance**, **dashboard**) |

Connecting them: a shared **database** and — added in the **final** phase — a **WhatsApp Business** channel for confirmations, reminders, and invoices/receipts.

```
        ┌─────────────────────────────────────────────────────┐
        │                   PATIENT / PUBLIC                    │
        └───────────────┬───────────────────────┬───────────────┘
                        │                       │
                ┌───────▼───────┐       ┌───────▼────────┐
                │ 1. LANDING    │       │ 2. BOOKING     │
                │    PAGE       │──────▶│   (appointments│
                │ (brand+leads) │       │   & classes)   │
                └───────┬───────┘       └───────┬────────┘
                        │   leads / bookings    │
                        └───────────┬───────────┘
                                    ▼
                        ┌───────────────────────┐        ┌───────────────────────────┐
                        │   SHARED DATABASE      │◀──────▶│  3. MIS  (Admin + Doctors) │
                        │ (patients, services,   │        │  • Appointments            │
                        │  appointments, invoices,│        │  • Yoga sessions           │
                        │  finance, leads)        │        │  • Doctors / patients      │
                        └───────────┬───────────┘        │  • Billing + FINANCE       │
                                    │                     │  • DASHBOARD / analytics   │
                                    ▼                     └───────────────────────────┘
                        ┌───────────────────────────────┐
                        │  WhatsApp Business API          │  ← FINAL phase: confirmations,
                        │  (notifications / billing)      │     reminders, invoices & receipts
                        └───────────────────────────────┘
```

### Service lines (what IYKA actually sells)

These three appear on the website *and* drive the booking + MIS logic:

1. **Functional Medicine Consultation** — 1:1 with a doctor; **offline** (at the centre) or **online** (video). Slot-based.
2. **Offline Session** — naturopathy / therapy session at the centre; slot-based (1:1 or small group).
3. **Online Yoga Class** — instructor-led **group** class on a recurring schedule; seat-based (capacity-limited).
4. **Products** — wellness products shown with price; *(v1: catalogue + enquiry-to-order; full e-commerce checkout is v2 — see §10)*.

---

## 2. Technology recommendation (plain-language)

**You asked which is best, given you don't code yourself.** Here is a clear recommendation and the reasoning — no jargon.

### Recommendation: **One language, one app — Next.js (TypeScript)**

| Layer | Choice | Why it's the right call for you |
|-------|--------|---------------------------------|
| **Whole app (website + booking + MIS + API)** | **Next.js** (TypeScript) | Best-in-class for the *premium, animated, "sells in the first look"* landing page you want — **and** strong enough to run the back-office MIS. One framework for everything. |
| **Database** | **PostgreSQL** (managed — e.g. Neon or Supabase) | Reliable, industry-standard, "managed" means you don't run a server. |
| **Data layer** | **Prisma** | Lets developers/AI describe your data (patients, appointments, invoices) safely and clearly. |
| **Login for MIS** | **Auth.js** or **Clerk** | Secure logins + roles (Admin vs Doctor) with minimal effort. |
| **Charts / dashboard** | **Recharts** or **Tremor** (React) | Purpose-built for clean, premium analytics dashboards (see §6). |
| **Hosting** | **Vercel** (app) + managed Postgres | Push-button deploys, fast global delivery — supports the "premium" feel. |
| **WhatsApp** | An **Indian WhatsApp Business provider** (AiSensy / Interakt / Gupshup) | They handle Meta approval and message templates for you. (See §7.) |

### Why this over the earlier "NestJS + Next.js" advice

The earlier suggestion isn't *wrong* — NestJS + Next.js is a popular, modern combo. But **NestJS is a second, separate backend framework**, which means two codebases, two things to deploy, and more to maintain. For a non-technical owner launching v1, that's avoidable complexity and cost.

- **Keep Next.js** — the earlier advice was right that this is excellent for your premium site.
- **Drop the separate NestJS for now** — Next.js can run the backend/API *and* the front-end as a single app. You can always add a dedicated NestJS backend **later** if the MIS grows large. Starting simpler = cheaper to build, easier to hire for, fewer moving parts.

**Net:** ✅ Next.js (TypeScript), one app, PostgreSQL, Vercel.

> **A note on hiring/building:** Next.js + TypeScript is one of the most common stacks in the world, so developers (and AI assistants) are abundant and affordable. Whether I build this with you step-by-step or you hire a developer, this choice keeps that flexible.

> **The Python `.venv` already in your project folder** is left over from earlier exploration and is not used by this plan — it can be ignored or deleted.

---

## 3. MODULE 1 — Landing Page

### 3.1 Purpose
A high-end brand statement that **converts first impressions into bookings and enquiries**. Per the brief: *high-end, classy, simple, clean, spacious, easy to read* — and explicitly **not** generic, **not** traditional-wellness-looking, **not** boring. Visual reference: premium *foreign* wellness brands (Buff Wellness, Ultrahuman) — **not** Ayurveda/homeopathy aesthetics. (Design direction detailed in §6.)

### 3.2 Page structure & content (functionality)

| Section | What it shows | Behaviour / logic |
|---------|---------------|-------------------|
| **Hero** | Slow slideshow of the brand logo over scenic Meghalaya backdrops. Rotating highlight lines: *"Clinical Wellness in Northeast India · Longevity"*, *"Functional Medicine — Yoga & Naturopathy \| A New Dimension of Medicine"*, *"Drugless Healthcare \| Integrative Health"*, *"Meghalaya"* | Auto-advancing slow fade; persistent **"Book / Enquire"** call-to-action; subtle, premium motion. |
| **Booking & Contact pop-up** | A modal that catches the first visit — *"For Sales & Inquiries"* | Triggered by CTA (and optionally once per visit on scroll/exit-intent). Routes to **Module 2 (Booking)** or captures a **Lead** (see §3.3). |
| **Our Mission** | *First NE startup going drugless in healthcare.* Premium narrative, integrative-health positioning. | Static, editable via CMS. |
| **Recognition** | Badges: **Ministry of Education, Govt. of India** and **Ministry of AYUSH, Govt. of India**. | Trust signals near top. |
| **Display / Social proof** | Reels & podcast embeds, testimonials, yoga events, property slides, wellness food ("5-star display"), Meghalaya map. | Content-managed; lazy-loaded media for speed. |
| **People** | Doctors, therapies, yoga instructor(s), nutritionist. | Pulled from the same staff data the MIS uses (single source of truth). |
| **Products** | Product cards with **price** + a "Buy / Enquire" action; "Delivery pan-India" messaging. | **v1:** enquiry-to-order (adds a Lead + WhatsApp ping). **v2:** full cart + checkout (see §10). |
| **Footer / Contact** | Contact details, social links, location/map. | Click-to-WhatsApp, click-to-call. |

### 3.3 Lead / enquiry logic
- The pop-up and product enquiries capture: **name, phone (WhatsApp), email (optional), interest, message**.
- On submit → create a **Lead** record in the database → notify front-desk (email in early phases; WhatsApp once §7 is live).
- Leads appear in the MIS so front-desk can follow up. This makes the website a genuine sales tool, not a brochure.

### 3.4 Key navigation tabs (from brief)
`About · Our Story · Team · Gallery · Services · Products · Contact` — Services links into the three booking flows; Products into the catalogue.

### 3.5 Non-functional requirements (these *are* the "premium" feel)
- **Performance:** fast loads / strong Core Web Vitals — a slow site reads as "cheap."
- **Responsive:** flawless on mobile (most NE traffic is mobile).
- **SEO:** meta tags, social share cards, sitemap — so IYKA is findable.
- **Content management:** front-desk should edit testimonials, team, events, gallery, products **without a developer** (a lightweight CMS).
- **Accessibility & clean typography:** "nothing overdone," easy to read.

---

## 4. MODULE 2 — Booking of Appointment

### 4.1 Two booking patterns (this is the core logic decision)
The three service lines split into **two** technically different patterns:

| Pattern | Applies to | Model |
|---------|-----------|-------|
| **A. Slot booking (1:1)** | Functional Medicine Consultation; Offline Session | Patient reserves a **specific time slot** with a **specific provider**. No double-booking. |
| **B. Seat booking (group)** | Online Yoga Class | Patient reserves a **seat** in a **scheduled class occurrence** that has a **capacity**. Many patients, one instructor, one time. |

Getting this distinction right up front avoids rebuilding the booking engine later.

### 4.2 Booking flow (patient side)

```
Choose service line
   │
   ├─ Consultation / Offline session ──▶ (optional) choose doctor/therapist
   │                                   └▶ pick date → see available slots → pick slot
   │
   └─ Online Yoga Class ──────────────▶ browse upcoming classes (date/time/instructor/seats left)
                                       └▶ pick a class occurrence
   │
   ▼
Enter details (name, phone/WhatsApp, email, reason/notes)
   │
   ▼
Confirm  ──▶  Booking created (status: REQUESTED or CONFIRMED)
   │
   ▼
Confirmation sent (email early on; WhatsApp once §7 live)  +  appears in MIS
```

- **No payment at booking** (v1 = pay in person). This keeps the flow short and friction-free.
- **Light identity:** booking by phone number; **optional OTP** (via WhatsApp/SMS) to reduce fake bookings. No heavy account required in v1.
- **Reschedule / cancel:** via a link in the confirmation, within rules (e.g. up to X hours before).

### 4.3 Availability logic
- **Providers** (doctors/therapists) have **working hours** and **blocked times**; the system generates bookable slots from those minus already-booked appointments, with optional **buffer** between slots.
- **Yoga classes** have a **recurring schedule** (e.g. Mon/Wed/Fri 7am) that generates **class occurrences**, each with a **capacity**; booking decrements seats; full classes show "waitlist" or "full."
- **Front-desk override:** the MIS can block slots, add walk-ins, or close a day (holidays) — and the website reflects it immediately.

### 4.4 Booking state machine
`REQUESTED → CONFIRMED → CHECKED-IN → COMPLETED`
plus `CANCELLED`, `NO-SHOW`, `RESCHEDULED`. Each transition can trigger a notification (confirmation, reminder, cancellation).

### 4.5 Notifications tied to booking
- **On confirm:** confirmation message (date, time, mode, location/online link).
- **Reminder:** e.g. 24h and/or 2h before.
- **Online sessions:** include the video link in the message.
- *Delivery channel is email in early phases and switches/adds WhatsApp in the final phase (§7).*

---

## 5. MODULE 3 — MIS (Back-office)

The operational heart: **appointments, yoga sessions, doctors, patients, billing, finance, and a dashboard**, used by **Admin/Front-desk** (full) and **Doctors** (limited).

### 5.1 Roles & permissions

| Capability | Admin / Front-desk | Doctor |
|------------|:---:|:---:|
| View **all** appointments & calendar | ✅ | ❌ (own only) |
| Create / edit / cancel / reschedule appointments | ✅ | ✅ (own only) |
| Manage yoga classes, schedules, attendance | ✅ | ❌ |
| Manage doctors, therapists, instructors (as records) | ✅ | ❌ |
| Set own availability / schedule | ✅ (for all) | ✅ (own) |
| View / edit patient profile | ✅ | ✅ (own patients) |
| Write consultation notes (EMR-lite) | ❌ | ✅ (own consults) |
| Create & send invoices/receipts | ✅ | ❌ (view own optional) |
| **Finance** — expenses, P&L, payouts, reconciliation | ✅ | ❌ |
| **Dashboard** — full operational + financial view | ✅ | ❌ (own stats only) |
| Settings (services, pricing, templates, users) | ✅ | ❌ |

> **Yoga instructors do not log in** — front-desk manages classes and attendance on their behalf (per your decision). Instructors exist as **staff records** so they show on the website and on class rosters.

### 5.2 Functional areas

**(a) Appointments management**
- Day/week **calendar** + list view; filter by doctor, service, status.
- Create/edit/reschedule/cancel; mark **checked-in / completed / no-show**.
- Walk-in entry. See linked patient history.

**(b) Yoga session management**
- Define **class types** and **recurring schedules**; auto-generate occurrences with capacity.
- See enrolled attendees per occurrence; mark **attendance**; manage online class link.
- Front-desk can add/remove attendees and handle waitlists.

**(c) Doctors & staff management**
- Profiles (name, role, specialties, photo, bio — shared with the website).
- Doctor **availability/schedule**; link to their consultations.

**(d) Patient records (EMR-lite)**
- Patient master: demographics, contact, **consent flags**, visit history.
- **Consultation notes** entered by the treating doctor (kept intentionally *lite* in v1 — not a full regulated EMR; see §8).

**(e) Billing & invoicing** *(payment recorded as in-person in v1)*
- Generate **itemised invoice/receipt** for a consultation, session, class, or product order.
- **GST-aware** line items + sequential invoice numbering.
- Record payment **method** (cash / UPI / card) and mark **paid**; track outstanding.
- Sending the invoice/receipt via **WhatsApp** is wired in during the final phase (§7); until then it can be downloaded/printed/emailed.

**(f) Finance** *(NEW — the books, distinct from patient billing)*
This is the money-management layer for the business, not just patient invoices.
- **Revenue tracking:** auto-rolls up from paid invoices — by **service line, doctor, class, day/week/month, payment method**.
- **Expense tracking:** record operational costs (rent, salaries, supplies, marketing, utilities) under **expense categories**; attach receipts.
- **Profit & Loss view:** revenue − expenses over a period; margins by service line.
- **Reconciliation / daily cash close:** end-of-day tally of cash / UPI / card vs. recorded payments, so front-desk can balance the till.
- **Doctor / staff payouts:** track what's owed to each doctor — supports either a **fixed salary** or a **per-consultation / commission** model (which one applies is an open decision — see §11).
- **Outstanding & receivables:** unpaid/partially-paid invoices.
- **Refunds & adjustments:** with reason and audit trail.
- **Tax / GST summary:** period totals to hand to your accountant.
- **Exports:** CSV/Excel (and optionally a format compatible with Tally / Zoho Books — see §11), so an accountant can take over filing.

**(g) Dashboard & analytics** *(NEW — central hub over all collected data)*
A single screen that turns the data the platform collects into decisions. **Role-aware:** Admin sees everything; a doctor sees only their own stats.

- **Today / live strip:** today's appointments, check-ins, no-shows, today's collection, classes running now.
- **Operations:** appointment volume & trend, **occupancy / utilisation** per doctor and per class, no-show rate, cancellations, busiest times.
- **Finance:** revenue trend, revenue by service line, expenses vs. revenue, P&L snapshot, outstanding amount, average revenue per patient.
- **Patients & growth:** new vs. returning patients, retention, **lead pipeline & conversion** (from the website enquiries).
- **Yoga:** class fill rates, attendance trends, most popular classes/instructors.
- **Controls:** date-range filter, compare-to-previous-period, drill-down from any chart into the underlying list, **export to CSV/PDF**.
- Built with clean, premium data-visualisation (see §6) — **not** a cluttered admin panel.

**(h) Settings**
- Services & pricing catalogue, doctor/staff records, class schedules, expense categories, users & roles, message templates.

### 5.3 Core data model (entities & relationships)

```
User (Admin | Doctor) ──┐
                        │ (a Doctor links to a Staff/Provider record)
Staff/Provider ─────────┼──< Availability
   (doctor/therapist/   │
    instructor/         ├──< ClassSchedule ──< ClassOccurrence ──< Enrollment >── Patient
    nutritionist)       │
                        ├──< Appointment >── Patient
                        │        │
                        │        └──< ConsultationNote (by Doctor)
                        │
                        └──< Payout            (finance: what each provider is owed)

Service (type, mode, duration, price, requires_provider)

Patient ──< Invoice ──< InvoiceLineItem        Invoice ──< Payment   (→ Revenue)
Patient ──< Lead (from website)

Expense >── ExpenseCategory                    Product (name, price, images, stock?)
MessageLog (WhatsApp/email sends + delivery status)
```

Key entities: **User, Staff/Provider, Service, Availability, ClassSchedule, ClassOccurrence, Patient, Appointment, Enrollment, ConsultationNote, Invoice, InvoiceLineItem, Payment, Payout, Expense, ExpenseCategory, Product, Lead, MessageLog.**
*Finance adds: **Expense, ExpenseCategory, Payout** (revenue is derived from Invoice + Payment).*

---

## 6. UI/UX & Design direction

You asked to focus on UI/UX for the **landing page** and the **dashboard**. These are two different design problems and need two different treatments — but one consistent brand.

### 6.1 Shared design system (the foundation)
- **One brand kit:** colour palette derived from the logo, one premium typeface pairing, consistent spacing, icons, and components reused everywhere. Build this once; both faces of the product draw from it.
- **Tone:** premium, calm, spacious, confident — references foreign wellness brands, *not* traditional/Ayurvedic visuals.
- **Component library:** use a clean, modern React UI kit (e.g. **shadcn/ui** + **Tailwind CSS**) so screens are consistent and fast to build.

### 6.2 Landing page — "sell in the first look"
- **Generous whitespace**, large editorial imagery, restrained palette — luxury comes from *space and restraint*, not decoration. "Nothing overdone."
- **Motion with intent:** slow, subtle fades and parallax on the hero; nothing flashy or "AI-templated."
- **Strong visual hierarchy:** one clear message and one clear action per screenful; the **Book/Enquire** CTA always reachable.
- **Mobile-first:** designed for the phone first, then scaled up.
- **Speed = perceived quality:** optimised images, fast first paint.

### 6.3 Dashboard & MIS — "clarity over decoration"
- **Information hierarchy first:** the most important numbers (today's revenue, appointments, no-shows) biggest and at the top; supporting detail below.
- **Scannable data:** clean tables, clear charts (line for trends, bar for comparisons, donut sparingly), consistent number/date/₹ formatting.
- **Role-aware layout:** Admin sees the full picture; a doctor sees a focused, simpler view of their own day and patients.
- **Low cognitive load:** sensible defaults, filters that remember choices, drill-down instead of clutter, empty states that guide the user.
- **Calm, professional palette:** muted/neutral base so charts and status colours (paid/unpaid, confirmed/no-show) stand out meaningfully.
- **Responsive & fast:** front-desk may use a tablet; the layout must hold up.
- **Consistent with the brand** but optimised for *work*, not for *selling*.

### 6.4 Process
- Start with a quick **wireframe / clickable prototype** (e.g. in Figma) for the landing page and the main dashboard **before** coding, so we agree on look-and-feel early and avoid expensive rework.

---

## 7. WhatsApp Billing & Notifications *(built in the FINAL phase)*

Per your direction, this is the **last** thing we integrate — the core website, booking, MIS, finance, and dashboard are fully usable without it (using email / print in the meantime).

> **One caveat worth acting on early:** getting a WhatsApp Business number **verified and templates approved by Meta has lead time** (often 1–3 weeks). So while we *build* the integration last, it's worth **starting the account/approval paperwork in parallel** earlier, so approval isn't the thing that holds up launch.

### 7.1 Approach
- Use the **WhatsApp Business API** through an **Indian Business Solution Provider (BSP)** — e.g. **AiSensy, Interakt, or Gupshup**. They simplify Meta verification and **message-template** approval.
- Requires: a **verified WhatsApp Business Account**, a dedicated business phone number, and **pre-approved message templates** (Meta requires templates for business-initiated messages like confirmations, reminders, and invoices).

### 7.2 What gets sent
| Trigger | Message (template) | Contains |
|---------|--------------------|----------|
| Booking confirmed | `booking_confirmation` | service, date/time, mode, location or video link |
| Before appointment | `appointment_reminder` | reminder + reschedule link |
| Reschedule / cancel | `reschedule_notice` / `cancellation_notice` | new details / confirmation |
| Class enrolled | `class_enrollment_confirmation` | class, time, link |
| **Invoice / receipt** | `invoice_receipt` | itemised amount, invoice no., **PDF attachment** |
| Lead acknowledgement (optional) | `lead_ack` | "we'll be in touch" |

### 7.3 Billing logic (v1 = notification only)
1. Front-desk generates the invoice/receipt in the MIS.
2. System creates a **PDF** and sends it via the `invoice_receipt` WhatsApp template to the patient's number.
3. **Delivery status** (sent/delivered/read/failed) is captured via webhook and logged in **MessageLog**.
4. **No online payment link in v1** — payment is taken in person and recorded in the MIS. *(v2 adds a Razorpay payment link — see §10.)*

### 7.4 Requirements & guardrails
- **Opt-in / consent** to receive WhatsApp messages (capture at booking).
- Phone numbers stored in **E.164** format (`+91…`).
- **Optional SMS fallback** if a WhatsApp send fails (you chose WhatsApp-first; SMS can be added cheaply later).

---

## 8. Compliance, privacy & content notes (healthcare = handle with care)

- **DPDP Act 2023 (India):** patient personal/health data needs **consent**, **secure storage**, **access control**, and a basic privacy policy. Build consent capture into booking and the website.
- **EMR scope:** keep clinical notes **lite** in v1. A full regulated EMR is a much larger, compliance-heavy project — flag for later if needed.
- **Marketing claims:** "drugless / functional medicine" copy should avoid disease-cure claims; include sensible **medical disclaimers**. (Content/legal review, not a build task.)
- **GST & invoicing:** invoices should be GST-compliant with sequential numbering; finance exports should match what your accountant files.

---

## 9. Phased delivery plan (the actual work sequence)

Each phase is shippable on its own, so value lands early and risk stays low. **WhatsApp integration is the final phase**, as requested.

| Phase | Deliverable | Why this order |
|-------|-------------|----------------|
| **0 — Foundations** | Tech setup (Next.js + Postgres + hosting), **brand/design system + wireframes (§6)**, content gathering, data-model build. *(Optionally start the WhatsApp Business account application in parallel — approval has lead time.)* | Unblocks everything; agree on look-and-feel before building. |
| **1 — Landing Page** | Premium marketing site + lead/enquiry capture → email to front-desk. | Brand presence live fast; starts generating leads. |
| **2 — Booking** | Services catalogue + slot booking (consult/offline) + class booking (yoga) + confirmations/reminders by **email**. | Turns the site into a booking engine. |
| **3 — MIS core** | Logins & roles (Admin/Doctor), appointments calendar, doctors & availability, patient records. | Back-office can now run daily operations. |
| **4 — Yoga sessions** | Class schedules, occurrences, attendance, online links in MIS. | Completes operational scheduling. |
| **5 — Billing & Finance** | Invoices/receipts, GST line items, payment recording **+ the Finance area** (expenses, P&L, reconciliation, payouts, exports). | Closes the money loop and gives you real books. |
| **6 — Dashboard & Analytics** | The central, role-aware dashboard over all operational + financial data, with the polished data-viz UI/UX. | Best built once real data is flowing from earlier phases. |
| **7 — WhatsApp integration** *(FINAL)* | Wire WhatsApp into bookings (confirmations/reminders) **and** billing (invoice/receipt delivery + delivery tracking). | Done last per your direction; account approval prepared in parallel from Phase 0. |
| **8 — v2 add-ons** | Online payments (Razorpay links), full product e-commerce + pan-India shipping, online video for consults/yoga, patient self-service portal. | Deferred per your v1 scope decisions. |

---

## 10. What's explicitly **out of v1** (deferred to v2)
Per your decisions, to keep v1 focused:
- **Online payment collection** (Razorpay payment links) — v1 is invoice/receipt notification only.
- **Full product e-commerce** (cart, checkout, shipping/tracking) — v1 Products = catalogue + enquiry-to-order.
- **Yoga instructor logins** — front-desk manages classes for them.
- **Full regulated EMR** — v1 keeps clinical notes lite.

---

## 11. Open decisions I still need from you

These don't block planning, but I'll need them before/at the relevant phase:

1. **Brand assets:** Do you have the logo in vector form, brand colours, fonts, and high-res scenic Meghalaya photos? (Drives the premium look and the design system in §6.)
2. **Doctors/services list:** Names, specialties, consultation durations and prices; therapy/session list; yoga class schedule.
3. **Finance — doctor payment model:** Are doctors paid a **fixed salary**, or **per-consultation / commission**? (Determines how Payouts work in §5.2f.)
4. **Finance — accounting handoff:** Do you use (or want exports compatible with) **Tally / Zoho Books / an accountant's tool**? What expense categories matter to you?
5. **Online consults/yoga:** Which video tool — Google Meet / Zoom links, or in-app video later?
6. **WhatsApp number:** Is there a dedicated business phone number for the WhatsApp Business Account? (Start approval early even though integration is last.)
7. **Who operates day-to-day:** How many front-desk users and doctors will need logins at launch?
8. **Content:** Source for testimonials, reels/podcast, gallery, and product details.
9. **Build model:** Should I build this with you phase-by-phase, or are you bringing in a developer (the stack supports both)?

---

*Prepared for IYKA-ARAM Wellness · Work plan v2 · 2026-06-19*
