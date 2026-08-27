/* One-off: crop the client's stock service photography into the two shapes
   the site asks for, and write webp into /public/services:
     <slug>.webp        383×519 at 2× — the landing rail card (.sv-card)
     wide/<slug>.webp   4:3   at 2× — the /services detail rows (.svd-media)
   One portrait file cannot serve both; a 4:3 box cropping a 383×519 source
   cuts the top and bottom off every frame, which beheads the portraits.
   Sources live outside the repo (~/Downloads); re-run only if they change. */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "C:/Users/This PC/Downloads";
const OUT = path.join(process.cwd(), "public", "services");
const CARD = [766, 1038]; // 383 × 519 at 2× DPR
const WIDE = [1200, 900]; // 4:3 at 2×; the column tops out near 588px CSS

const map = [
  ["close-up-therapist-massaging-arm.jpg", "acupuncture"],
  ["flat-lay-natural-medicinal-herbs.jpg", "naturopathy"],
  ["women-doing-yoga-cleaning-chakra.jpg", "yoga-therapy"],
  ["nurse-putting-oxygen-mask-patient.jpg", "ozone-therapy"],
  ["two-women-beautician-doctor-client-stand-mirror-consultation-doctor-applies-cream-woman-s-hands-makes-light-massage.jpg", "functional-medicine"],
  ["glass-smoothie-from-berries-childs-hand-home-kitchen.jpg", "functional-nutrition"],
  ["portrait-attractive-woman-sitting-kitchen-table.jpg", "gut-health-reset"],
  ["smiley-woman-holding-green-crystal.jpg", "energy-medicine"],
  ["portrait-older-woman-outdoors-by-lake.jpg", "longevity"],
  ["neurologist-specialist-analyzing-nervous-system-tomography-monitor-while-specialist-doctor-adjusting-eeg-scanner-woman-patient-medical-experiment-neurology-team-monitoring-brain-activity.jpg", "biohacking"],
  ["toa-heftiba-a9pFSC8dTlo-unsplash.jpg", "massage"],
  ["edward-muntinga-WDKd49Vo4tM-unsplash.jpg", "physiotherapy"],
];

await mkdir(OUT, { recursive: true });
await mkdir(path.join(OUT, "wide"), { recursive: true });

for (const [file, slug] of map) {
  for (const [dir, [w, h]] of [["", CARD], ["wide", WIDE]]) {
    const dest = path.join(OUT, dir, `${slug}.webp`);
    const info = await sharp(path.join(SRC, file))
      .rotate()
      .resize(w, h, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: 82 })
      .toFile(dest);
    console.log(
      `${dir ? dir + "/" : ""}${slug}.webp  ${info.width}x${info.height}  ` +
        `${(info.size / 1024).toFixed(0)}KB`,
    );
  }
}
