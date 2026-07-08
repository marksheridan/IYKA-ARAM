import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function mdToHtml(md: string): string {
  return md
    .split("\n\n")
    .map((block) => {
      if (block.startsWith("**") && block.endsWith("**")) {
        return `<h3>${block.replace(/\*\*/g, "")}</h3>`;
      }
      const withBold = block.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      if (block.startsWith("- ")) {
        const items = block.split("\n").map((l) => `<li>${l.replace(/^- /, "").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${withBold}</p>`;
    })
    .join("\n");
}

const posts = [
  {
    slug: "understanding-your-dosha",
    title: "The Ancient Wisdom of Ayurveda: Understanding Your Dosha",
    date: new Date("2026-06-10"),
    category: "Ayurveda",
    coverImage: "/gallery/img1.jpg",
    excerpt: "Discover how the three doshas — Vata, Pitta, and Kapha — shape your physical and mental constitution, and how knowing yours can transform your daily wellness routine.",
    content: `Ayurveda, the 5,000-year-old science of life, rests on a beautifully simple principle: every person is unique. At the heart of this philosophy are the three doshas — Vata, Pitta, and Kapha — energetic forces that govern everything from your digestion to your temperament.

**What Is a Dosha?**

A dosha is a combination of the five elements (earth, water, fire, air, and ether) that expresses itself in your body and mind. Most people carry a blend of all three, with one or two dominating.

- **Vata** (air + ether) governs movement, creativity, and communication. When balanced, Vata types are lively, imaginative, and quick-thinking. When out of balance, anxiety, dryness, and restlessness can arise.

- **Pitta** (fire + water) drives digestion, intelligence, and transformation. Balanced Pitta brings focus, warmth, and courage. Excess Pitta can manifest as irritability, inflammation, or burnout.

- **Kapha** (earth + water) provides structure, stability, and endurance. Balanced Kapha is calm, nurturing, and resilient. When heavy, it can lead to lethargy, congestion, or resistance to change.

**Why It Matters**

Understanding your dosha is not about putting yourself in a box — it is about recognising your natural tendencies and working with them rather than against them. A Vata-dominant person thrives on routine and warmth. A Pitta type benefits from cooling practices and rest. A Kapha constitution flourishes with stimulation and movement.

**A Simple Starting Point**

Notice which qualities feel most like you — light and variable, intense and focused, or steady and grounded. From there, Ayurvedic guidelines suggest foods, daily rhythms, and practices tailored to keep your dominant dosha in harmony.

At IYKA-ARAM, our practitioners weave Ayurvedic principles into every consultation, helping you understand the root of imbalance rather than simply addressing its symptoms. Wellness, in this tradition, is not the absence of disease — it is the radiant expression of your natural state.`,
  },
  {
    slug: "pranayama-and-the-nervous-system",
    title: "Breathwork and the Nervous System: How Pranayama Calms the Mind",
    date: new Date("2026-06-18"),
    category: "Yoga & Breathwork",
    coverImage: "/gallery/img3.jpg",
    excerpt: "Modern neuroscience is confirming what yogis have known for centuries — conscious breathing is one of the most powerful tools we have for regulating stress and restoring inner calm.",
    content: `Breath is the only autonomic function we can consciously control. That single fact makes it a remarkable bridge between the thinking mind and the body's involuntary systems — and it is the foundation of pranayama, the yogic science of breath regulation.

**The Science Behind the Practice**

When you lengthen your exhale or slow your breath below six cycles per minute, you activate the parasympathetic nervous system — the branch responsible for rest, digestion, and recovery. Heart rate variability improves. Cortisol levels drop. The amygdala, the brain's threat-detection centre, quietens.

Research from Stanford and Harvard in recent years has confirmed that specific breathing patterns directly influence the brain's emotional regulation centres, offering measurable relief from anxiety, insomnia, and chronic stress.

**Three Foundational Techniques**

**Nadi Shodhana (Alternate Nostril Breathing)**
Alternate nostril breathing balances the left and right hemispheres of the brain. Sit comfortably, close the right nostril with your thumb, inhale through the left, then switch. Four to six rounds is enough to feel a shift in clarity and calm.

**Bhramari (Humming Bee Breath)**
The vibration produced by humming stimulates the vagus nerve — the highway of the parasympathetic system. Close your eyes, inhale deeply, and exhale with a gentle hum. Repeat five times. It is particularly effective before sleep or during moments of acute stress.

**4-7-8 Breathing**
Inhale for four counts, hold for seven, exhale for eight. The extended exhale is the key — it signals safety to the nervous system. Even two cycles can interrupt a stress response mid-moment.

**Making It a Daily Practice**

Pranayama does not require a studio, a mat, or even much time. Five minutes in the morning before you reach for your phone, or three cycles before a difficult conversation, can shift the quality of your entire day.

At IYKA-ARAM, breathwork is integrated into our yoga and wellness sessions as both a standalone practice and a complement to Ayurvedic treatment. The breath, our teachers say, is always available — it is the most immediate medicine we carry.`,
  },
];

async function main() {
  console.log("Seeding blog posts…");
  for (const p of posts) {
    const html = mdToHtml(p.content);
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: html,
        coverImage: p.coverImage,
        category: p.category,
        author: "IYKA-ARAM Wellness Team",
        published: true,
        publishedAt: p.date,
      },
    });
    console.log(`  ✓ ${p.title}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
