/**
 * IYKA-ARAM — single source of truth for all website copy & data.
 *
 * This is your lightweight CMS: edit text, prices, team, testimonials, contact
 * details and links here and the whole site updates. Add an `image` path
 * (a file you drop into /public, e.g. "/brand/dr-rao.jpg") and the matching
 * section will show the photo instead of the placeholder.
 *
 * Items marked PLACEHOLDER are stand-ins — replace with real content.
 */

export const business = {
  name: "IYKA-ARAM Wellness",
  shortName: "IYKA-ARAM",
  tagline: "Wellness Starts Here.",
  // PLACEHOLDER contact details — replace with the real ones.
  phone: "+91 00000 00000",
  phoneHref: "tel:+910000000000",
  whatsapp: "+91 00000 00000",
  whatsappHref: "https://wa.me/910000000000",
  email: "hello@iyka-aram.com",
  location: "Meghalaya, Northeast India",
  address: "PLACEHOLDER — full street address, Meghalaya",
  mapEmbedUrl: "", // paste a Google Maps embed URL to show a live map
  socials: [
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
    { label: "Facebook", href: "#" },
  ],
  // Production domain (used for SEO/social links). Update when the domain is live.
  url: "https://iyka-aram.com",
};

export const nav = [
  { href: "/#mission", label: "Mission" },
  { href: "/#services", label: "Services" },
  { href: "/#team", label: "Team" },
  { href: "/#products", label: "Products" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#contact", label: "Contact" },
];

export const hero = {
  kicker: "Meghalaya · Longevity",
  heading: "Wellness Starts Here",
  // Rotating highlight lines from the brand brief.
  lines: [
    "A New Dimension of Medicine",
    "Drugless Healthcare · Integrative Health",
    "Functional Medicine, Yoga & Naturopathy",
    "Clinical Wellness in Northeast India",
  ],
  subcopy:
    "The first wellness centre in the North East to go drugless in healthcare — premium, integrative, and rooted in nature.",
  // Optional: drop a hero photo in /public and set its path here, e.g. "/brand/hero.jpg".
  backgroundImage: "" as string,
};

export const recognition = [
  "Ministry of AYUSH, Govt. of India",
  "Ministry of Education, Govt. of India",
];

export const mission = {
  kicker: "Our Mission",
  heading:
    "A new dimension of medicine — where healing is drugless, integrative, and deeply human.",
  body: "IYKA-ARAM is the first start-up in the North East to highlight drugless healthcare. We blend functional medicine, yoga, and naturopathy into a premium standard of integrative care — set against the clean, living landscape of Meghalaya.",
  pillars: [
    { title: "Drugless", body: "Healing without dependence on medication." },
    { title: "Integrative", body: "Medicine, movement, and nutrition as one." },
    { title: "Longevity", body: "Care designed for a longer, fuller life." },
  ],
};

export type ServiceInterest =
  | "CONSULTATION"
  | "OFFLINE_SESSION"
  | "YOGA"
  | "PRODUCT"
  | "GENERAL";

export const services: {
  title: string;
  interest: ServiceInterest;
  desc: string;
  tag: string;
}[] = [
  {
    title: "Functional Medicine Consultation",
    interest: "CONSULTATION",
    desc: "One-to-one with our doctors — root-cause care, offline at the centre or online by video.",
    tag: "Offline / Online",
  },
  {
    title: "Offline Sessions",
    interest: "OFFLINE_SESSION",
    desc: "Naturopathy and therapy sessions delivered in person at our Meghalaya centre.",
    tag: "At the centre",
  },
  {
    title: "Online Yoga Classes",
    interest: "YOGA",
    desc: "Instructor-led group yoga, live online — join from anywhere, on a regular schedule.",
    tag: "Live online",
  },
];

export const team: {
  role: string;
  name?: string;
  initials: string;
  bio?: string;
  image?: string;
}[] = [
  { role: "Functional Medicine Doctor", initials: "Dr" }, // PLACEHOLDER
  { role: "Naturopathy Therapist", initials: "Th" },
  { role: "Yoga Instructor", initials: "Yo" },
  { role: "Nutritionist", initials: "Nu" },
];

export const testimonials: { quote: string; name: string }[] = [
  {
    quote:
      "A completely different approach to health — I finally feel cared for as a whole person, not a set of symptoms.",
    name: "Patient, Shillong", // PLACEHOLDER
  },
  {
    quote:
      "The yoga and naturopathy programme changed my daily energy. Premium, calm, and genuinely effective.",
    name: "Online Yoga Member",
  },
  {
    quote:
      "Drugless care that actually works. The team is world-class and the setting is breathtaking.",
    name: "Wellness Guest",
  },
];

export const products: {
  name: string;
  price: string;
  desc?: string;
  image?: string;
}[] = [
  { name: "Wellness Tea Blend", price: "₹ 499" }, // PLACEHOLDER
  { name: "Naturopathy Care Kit", price: "₹ 1,299" },
  { name: "Daily Greens Supplement", price: "₹ 899" },
];

export const location = {
  kicker: "Meghalaya",
  heading: "Healing, set in the cleanest corner of India",
  body: "Our centre is rooted in the hills of Meghalaya — clean air, living forests, and quiet. The setting is part of the medicine: a place designed to slow you down and bring you back to balance.",
};
