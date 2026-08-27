/* Single source of truth for the twelve services.
   Previously duplicated between components/site/services-section.tsx (the
   landing rail) and app/(site)/services/page.tsx, which carried a
   "keep the two in sync" comment. They now both read from here.

   Client-supplied service list (26 Jul 2026), in their order.
   IYKA-ARAM is NOT an Ayurveda clinic — Ayurveda and Panchakarma were
   removed at the client's request. Focus: Naturopathy & Yoga,
   Functional Medicine, Integrative Healthcare.

   IMAGERY. Client-supplied stock photography (26 Aug 2026), cropped to the
   landing card's 383x519 ratio at 2x by scripts/build-service-images.mjs and
   written to /public/services/<slug>.webp. These are stock, not IYKA-ARAM's
   own clinic, so each alt describes the photograph itself and never claims
   to show this practice's staff or patients. Two are stand-ins worth
   revisiting when real treatment photography exists: acupuncture has no
   needle frame (wrist point-work is the nearest available), and the ozone
   frame reads as surgical anaesthesia rather than ozone therapy.

   PLACEHOLDER COPY — `how` and `benefits` are written to describe what each
   modality generally involves and are deliberately non-prescriptive: no
   dosages, no outcome guarantees, no claims to treat named conditions.
   They still need sign-off from Dr. Emidaka before this page goes live. */

export type Service = {
  num: string;
  /** Anchor id, so the landing rail and nav can deep-link a single service. */
  slug: string;
  name: string;
  /** Short line used on the landing rail cards. */
  desc: string;
  /** Fuller line used at the top of each row on /services. */
  summary: string;
  /** Portrait 383x519 crop for the landing rail card. */
  img: string;
  /** 4:3 crop of the same frame for the /services detail rows. */
  imgWide: string;
  /** Describes the photograph, and is shared by both crops. */
  alt: string;
  /** What a course of treatment actually looks like, in order. */
  how: string[];
  /** What it is meant to leave you with once the course ends. */
  benefits: string[];
};

export const services: Service[] = [
  {
    num: "01",
    slug: "acupuncture",
    name: "Acupuncture",
    desc: "Precision needling to regulate pain, nerve function and energy flow",
    summary: "Precision needling to regulate pain, nerve function and energy flow.",
    img: "/services/acupuncture.webp",
    imgWide: "/services/wide/acupuncture.webp",
    alt: "A practitioner working pressure points along a patient's wrist and forearm",
    how: [
      "A first consultation maps your symptom history alongside sleep, digestion and stress load, with pulse and tongue assessment.",
      "Single-use sterile needles are placed at selected points and left in place while you rest, typically for twenty to thirty minutes.",
      "Sessions run as a short course rather than one-offs, with the point selection adjusted each visit as your response is reviewed.",
    ],
    benefits: [
      "Pain episodes that arrive less often and settle faster, with less reliance on symptomatic relief.",
      "A calmer stress response and steadier sleep as the nervous system stops running hot.",
      "A maintenance rhythm — occasional top-up sessions, not open-ended treatment.",
    ],
  },
  {
    num: "02",
    slug: "naturopathy",
    name: "Naturopathy",
    desc: "Drug-free healing using natural methods and elements",
    summary: "Drug-free healing using natural methods and the body's own repair capacity.",
    img: "/services/naturopathy.webp",
    imgWide: "/services/wide/naturopathy.webp",
    alt: "Dried herbs, rosemary, turmeric, ginkgo leaves and infused oil laid out in bowls",
    how: [
      "A full case history covering diet, hydration, sleep, elimination, movement and the shape of your ordinary day.",
      "Treatment draws on natural therapeutics — hydrotherapy, therapeutic diet, fasting protocols, mud and sun therapy — chosen for your presentation.",
      "You leave with a routine to run at home; clinic sessions reinforce it and the plan is revised at each review.",
    ],
    benefits: [
      "Habits that hold after the programme ends, rather than results that fade with the last appointment.",
      "Less dependence on symptomatic medication over time, managed in step with your prescriber.",
      "A clearer read on which foods and routines your body actually responds to.",
    ],
  },
  {
    num: "03",
    slug: "yoga-therapy",
    name: "Yoga Therapy",
    desc: "Therapeutic yoga for chronic conditions & mental wellness",
    summary: "Therapeutic yoga for chronic conditions and mental wellness, in-clinic or live online.",
    img: "/services/yoga-therapy.webp",
    imgWide: "/services/wide/yoga-therapy.webp",
    alt: "A yoga therapist guiding a student through a spinal stretch on the mat",
    how: [
      "An assessment of posture, breath pattern and mobility, read against the specific condition being addressed.",
      "A practice is built for you — asana, pranayama and relaxation — scaled to what you can sustain rather than what a class would do.",
      "Delivered in-clinic or live online, with a short daily home practice carrying the work between sessions.",
    ],
    benefits: [
      "Mobility and strength gains that hold, reducing how often chronic pain recurs.",
      "A self-regulation tool for anxiety and sleep that you can use without a therapist present.",
      "A practice you own — independence is the goal, not a standing appointment.",
    ],
  },
  {
    num: "04",
    slug: "ozone-therapy",
    name: "Ozone Therapy",
    desc: "Oxygen-based therapy for inflammation, immunity and recovery",
    summary: "Oxygen-based therapy used as one arm of a wider plan for inflammation and recovery.",
    img: "/services/ozone-therapy.webp",
    imgWide: "/services/wide/ozone-therapy.webp",
    alt: "A nurse holding a breathing mask over a patient resting on a treatment couch",
    how: [
      "Screening comes first: suitability is assessed against your history, current medication and any contraindications.",
      "Medical-grade ozone is delivered by the route appropriate to your case, at a measured dose, in a clinical setting.",
      "A defined short course, with your response reviewed throughout and the plan stopped or adjusted on what it shows.",
    ],
    benefits: [
      "Lower inflammatory load and better recovery capacity between treatments.",
      "Support for immune resilience alongside — never instead of — the rest of your care.",
      "Progress judged against markers and function, not impressions.",
    ],
  },
  {
    num: "05",
    slug: "functional-medicine",
    name: "Functional Medicine Consultation",
    desc: "Root-cause analysis to understand what drives your symptoms",
    summary: "Root-cause analysis to understand what is actually driving your symptoms.",
    img: "/services/functional-medicine.webp",
    imgWide: "/services/wide/functional-medicine.webp",
    alt: "A clinician in a white coat examining a patient's forearm during a consultation",
    how: [
      "A long first consultation — an hour or more — covering your timeline, triggers, family history and every prior investigation you can bring.",
      "Targeted testing only where the result would change the plan, rather than a panel ordered by default.",
      "A written plan addressing the drivers found, sequenced so you are never running six things at once, with reviews booked to adjust it.",
    ],
    benefits: [
      "Answers framed around cause rather than symptom suppression.",
      "Fewer competing interventions, because the plan is ordered rather than piled up.",
      "A documented health record you carry forward, whoever you see next.",
    ],
  },
  {
    num: "06",
    slug: "functional-nutrition",
    name: "Functional Nutrition Consultation",
    desc: "Food as medicine — personalised therapeutic diet plans",
    summary: "Food as medicine — therapeutic diet plans built around what you will realistically eat.",
    img: "/services/functional-nutrition.webp",
    imgWide: "/services/wide/functional-nutrition.webp",
    alt: "A berry smoothie and green juice beside fresh fruit, greens and avocado on a kitchen counter",
    how: [
      "Diet history and symptom mapping, with relevant nutritional testing where it adds something.",
      "A therapeutic plan built from foods you can source locally and will actually cook.",
      "Structured reintroduction and review, so any restriction is temporary and has a stated purpose.",
    ],
    benefits: [
      "A sustainable way of eating rather than a diet with an end date and a rebound.",
      "Stable energy, digestion and weight that hold without ongoing supervision.",
      "Clarity on your genuine triggers, so restriction stays as narrow as it can be.",
    ],
  },
  {
    num: "07",
    slug: "gut-health-reset",
    name: "Gut Health Reset Programs",
    desc: "Structured protocols to rebuild digestion and the microbiome",
    summary: "Structured, staged protocols to rebuild digestion and the microbiome.",
    img: "/services/gut-health-reset.webp",
    imgWide: "/services/wide/gut-health-reset.webp",
    alt: "A woman eating a bowl of fresh salad in a sunlit kitchen",
    how: [
      "Assessment of digestion, bowel pattern, antibiotic history and the stress load sitting behind it.",
      "A staged protocol — settle, repair, reintroduce — run over a defined number of weeks rather than indefinitely.",
      "Regular check-ins to adjust the pace and manage the transition between stages.",
    ],
    benefits: [
      "Durable relief from bloating, irregularity and discomfort rather than relief that lasts as long as the protocol.",
      "Tolerance of a wider range of foods as the programme unwinds.",
      "The downstream gains that tend to follow gut recovery — energy, skin, mood.",
    ],
  },
  {
    num: "08",
    slug: "energy-medicine",
    name: "Energy Medicine",
    desc: "Restoring the body's energetic balance to support deep healing",
    summary: "Restoring energetic balance to support the clinical arms of your plan.",
    img: "/services/energy-medicine.webp",
    imgWide: "/services/wide/energy-medicine.webp",
    alt: "A woman with her eyes closed holding a green crystal above her forehead",
    how: [
      "A session opens with an assessment of where you feel depleted, tense or stuck.",
      "Non-invasive techniques are applied while you rest, fully clothed, with nothing required of you.",
      "Usually paired with breathwork and paced to sit alongside your other treatments rather than compete with them.",
    ],
    benefits: [
      "A reliable way to down-regulate after long periods of sustained stress.",
      "Easier sleep onset and a steadier baseline mood.",
      "A complement to the clinical parts of your care — it is not offered as a replacement for them.",
    ],
  },
  {
    num: "09",
    slug: "longevity",
    name: "Longevity",
    desc: "Preventive, science-led care designed for a longer, fuller life",
    summary: "Preventive, science-led care aimed at healthspan, not just years.",
    img: "/services/longevity.webp",
    imgWide: "/services/wide/longevity.webp",
    alt: "An older woman wrapped in a shawl standing by a lake with her eyes closed",
    how: [
      "A baseline workup — metabolic markers, body composition, fitness, sleep and stress profile.",
      "Risks are prioritised into a plan you can actually run: movement, nutrition, sleep and recovery, in that order of leverage.",
      "Re-tested at intervals, so the plan follows your numbers rather than the calendar.",
    ],
    benefits: [
      "Capacity maintained into later decades — healthspan, not simply lifespan.",
      "Early sight of drift in your markers, while it is still cheap to correct.",
      "A compounding routine that gets easier to hold, not harder.",
    ],
  },
  {
    num: "10",
    slug: "biohacking",
    name: "Biohacking",
    desc: "Data-driven optimisation of sleep, energy, metabolism and focus",
    summary: "Data-driven optimisation of sleep, energy, metabolism and focus — tested on you.",
    img: "/services/biohacking.webp",
    imgWide: "/services/wide/biohacking.webp",
    alt: "Clinicians reading brain activity on a monitor while a patient wears an EEG cap",
    how: [
      "Establish a baseline from wearables, labs and a structured self-report, before changing anything.",
      "One variable at a time, for a set period, with the measure of success agreed in advance.",
      "Keep what demonstrably worked for you and drop what did not, rather than accumulating protocols.",
    ],
    benefits: [
      "A personal protocol built on your own data instead of generic advice.",
      "Focus, energy and sleep quality that hold because you know why they improved.",
      "The method itself — you keep the ability to test a change long after the programme ends.",
    ],
  },
  {
    num: "11",
    slug: "massage",
    name: "Massage",
    desc: "Therapeutic bodywork for tension, circulation and recovery",
    summary: "Therapeutic bodywork for tension, circulation and recovery.",
    img: "/services/massage.webp",
    imgWide: "/services/wide/massage.webp",
    alt: "A therapist's hands working along a patient's back during a massage",
    how: [
      "A short assessment of your pain pattern, movement restriction and any areas to avoid.",
      "Technique and pressure are chosen for the goal — recovery, tension release or circulation — not applied to a fixed routine.",
      "Aftercare and simple mobility work extend the effect between sessions.",
    ],
    benefits: [
      "Less accumulated tension, and fewer flare-ups from the postural load of ordinary work.",
      "Better circulation and faster recovery from training or physical labour.",
      "A sensible maintenance interval, rather than treatment only once you are in crisis.",
    ],
  },
  {
    num: "12",
    slug: "physiotherapy",
    name: "Physiotherapy",
    desc: "Movement-based rehabilitation and chronic pain management",
    summary: "Movement-based rehabilitation and chronic pain management.",
    img: "/services/physiotherapy.webp",
    imgWide: "/services/wide/physiotherapy.webp",
    alt: "A physiotherapist applying pressure along a patient's spine on a treatment couch",
    how: [
      "Objective assessment — range, strength, gait, and the specific movements that provoke your symptoms.",
      "Hands-on treatment paired with a graded exercise programme you run between visits.",
      "Load is progressed as you tolerate it, with reassessment at each stage rather than a fixed number of sessions.",
    ],
    benefits: [
      "A return to the activity you stopped, with the capacity to keep doing it.",
      "Lower recurrence risk, because strength and control are rebuilt rather than the pain merely settled.",
      "Self-management skills for handling future flare-ups yourself.",
    ],
  },
];
