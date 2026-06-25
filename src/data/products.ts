export interface Product {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  mrp: number;
  category: string;
  img: string;
  size: string;
  description: string;
  benefits: string[];
  ingredients: string;
  usage: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  badge?: string;
}

export const products: Product[] = [
  {
    slug: "keshanidhi-hair-oil",
    name: "Keshanidhi Hair Oil",
    tagline: "Ancient Ayurvedic formula for stronger, lustrous hair",
    price: 849,
    mrp: 999,
    category: "Hair Care",
    img: "/products/keshanidhi-hair-oil.jpg",
    size: "100 ml",
    description:
      "A sacred Ayurvedic blend of 21 herbs cold-pressed in pure sesame oil. Nourishes the scalp at the root level, reduces hair fall, and promotes natural hair growth with consistent use.",
    benefits: [
      "Reduces hair fall by up to 60%",
      "Stimulates dormant hair follicles",
      "Deeply nourishes and conditions",
      "Adds natural shine and thickness",
    ],
    ingredients: "Bhringraj, Amla, Brahmi, Neem, Hibiscus, Fenugreek in Sesame Oil base",
    usage:
      "Warm slightly and apply gently to scalp with fingertips. Massage in circular motions for 5 minutes. Leave overnight or for at least 1 hour. Wash with mild herbal shampoo. Use 2–3 times per week.",
    inStock: true,
    rating: 4.8,
    reviews: 124,
    badge: "Bestseller",
  },
  {
    slug: "organic-soap",
    name: "Herbal Organic Soap",
    tagline: "Cold-process soap with botanical actives, no SLS or parabens",
    price: 299,
    mrp: 350,
    category: "Skin Care",
    img: "/products/organic-soap.jpg",
    size: "100 g",
    description:
      "Handcrafted in small batches using the traditional cold-process method. Each bar contains raw botanical extracts that cleanse, hydrate, and gently exfoliate without stripping the skin's natural barrier.",
    benefits: [
      "Gentle on sensitive skin",
      "Retains natural glycerin",
      "Rich in antioxidants",
      "Zero synthetic preservatives",
    ],
    ingredients: "Saponified Coconut & Olive Oil, Turmeric extract, Neem powder, Sandalwood, Rose water",
    usage: "Lather with water and apply to wet skin. Rinse thoroughly. Store on a dry soap dish between uses.",
    inStock: true,
    rating: 4.7,
    reviews: 89,
  },
  {
    slug: "yoga-mat",
    name: "Organic Cork Yoga Mat",
    tagline: "Anti-microbial, non-slip cork surface with natural rubber base",
    price: 3499,
    mrp: 4200,
    category: "Yoga",
    img: "/products/yoga-mat.jpg",
    size: "183 × 61 cm, 4 mm",
    description:
      "Sustainably harvested cork top with a natural tree rubber base. Cork is naturally anti-microbial and gets grippier when wet — perfect for hot yoga. Zero PVC, zero TPE, zero synthetic foams.",
    benefits: [
      "Naturally anti-microbial",
      "Better grip when wet",
      "Biodegradable & sustainable",
      "4mm cushioning for joint support",
    ],
    ingredients: "Portuguese cork, natural tree rubber (no PVC, no synthetic foams)",
    usage:
      "Unroll and lay flat. Lightly dampen the cork surface before use for maximum grip. Clean with a damp cloth and natural soap. Air dry completely before rolling.",
    inStock: true,
    rating: 4.9,
    reviews: 56,
    badge: "Eco Choice",
  },
  {
    slug: "aloe-vera-gel",
    name: "Pure Aloe Vera Gel",
    tagline: "99% raw aloe with no alcohol, dyes, or artificial fragrance",
    price: 349,
    mrp: 399,
    category: "Skin Care",
    img: "/products/aloe-vera-gel.jpg",
    size: "200 ml",
    description:
      "Cold-extracted from organically grown aloe vera leaves within 4 hours of harvest. The gel retains all active polysaccharides and enzymes that soothe, heal, and hydrate skin and hair.",
    benefits: [
      "Soothes sunburn and irritation",
      "Lightweight daily moisturiser",
      "Seals hair cuticle and reduces frizz",
      "Safe for all skin types including acne-prone",
    ],
    ingredients: "99% Aloe Barbadensis Leaf Juice, Carbomer, Sodium Benzoate (as natural preservative)",
    usage:
      "Apply a thin layer to clean skin or hair. Can be used as a serum, after-sun gel, or hair mask. Leave on or rinse after 20 minutes for intensive hair treatment.",
    inStock: true,
    rating: 4.6,
    reviews: 203,
  },
  {
    slug: "stress-relief-oil",
    name: "Stress Relief Roll-On",
    tagline: "Adaptogenic blend to calm the nervous system on contact",
    price: 699,
    mrp: 799,
    category: "Wellness",
    img: "/products/stress-oil.jpg",
    size: "10 ml",
    description:
      "A clinical-grade aromatherapeutic roll-on formulated by Dr. Emidaka. Combines adaptogenic herbs with calming essential oils to provide quick relief during anxiety, stress peaks, or before sleep.",
    benefits: [
      "Reduces cortisol response",
      "Promotes calm without drowsiness",
      "Absorbs in 60 seconds",
      "Travel-friendly 10 ml roll-on",
    ],
    ingredients: "Ashwagandha root extract, Lavender EO, Bergamot EO, Clary Sage EO in Jojoba oil base",
    usage:
      "Roll onto pulse points — wrists, temples, behind ears. Inhale deeply 3 times. Use as needed, up to 5 times daily.",
    inStock: true,
    rating: 4.9,
    reviews: 178,
    badge: "Dr. Formulated",
  },
  {
    slug: "gastro-wellness-oil",
    name: "Gastro Wellness Oil",
    tagline: "Carminative blend for digestive ease and bloating relief",
    price: 649,
    mrp: 749,
    category: "Wellness",
    img: "/products/gastro-oil.jpg",
    size: "10 ml",
    description:
      "A warming digestive oil designed for topical application on the abdomen. The carminative essential oil blend activates the parasympathetic nervous system to ease bloating, gas, and sluggish digestion.",
    benefits: [
      "Relieves bloating and gas",
      "Warms and activates digestion",
      "Reduces post-meal discomfort",
      "Can be used during IBS flare-ups",
    ],
    ingredients: "Ginger EO, Peppermint EO, Fennel EO, Cumin seed extract in Castor & Sesame oil base",
    usage:
      "Warm 3–4 drops between palms and massage in clockwise circles on the abdomen after meals. Apply a warm cloth on top for deeper penetration.",
    inStock: true,
    rating: 4.7,
    reviews: 91,
  },
  {
    slug: "aura-bath-salt",
    name: "Aura Cleansing Bath Salt",
    tagline: "Mineral-rich ritual bath blend for deep relaxation",
    price: 799,
    mrp: 950,
    category: "Skin Care",
    img: "/products/aura-cleanser.jpg",
    size: "300 g",
    description:
      "A therapeutic bath soak blending Himalayan pink salt, Epsom salt, and dried botanicals. Regular use supports magnesium absorption, relaxes tense muscles, and leaves skin silky smooth.",
    benefits: [
      "Replenishes magnesium transdermally",
      "Draws out toxins through the skin",
      "Softens and smooths skin",
      "Promotes deep, restorative sleep",
    ],
    ingredients:
      "Himalayan Pink Salt, Magnesium Sulphate (Epsom), Dried Lavender, Rose petals, Sandalwood powder, Eucalyptus EO",
    usage:
      "Add 2–3 tablespoons to a warm bath. Soak for 20–30 minutes. For a foot soak, add 1 tablespoon to a basin of warm water. Use 2–3 times per week.",
    inStock: true,
    rating: 4.8,
    reviews: 145,
  },
  {
    slug: "muscle-recovery-oil",
    name: "Muscle Recovery Oil",
    tagline: "Deep-penetrating blend for post-workout soreness",
    price: 699,
    mrp: 799,
    category: "Wellness",
    img: "/products/muscle-oil.jpg",
    size: "50 ml",
    description:
      "A warming therapeutic oil for sore muscles, joint stiffness, and post-exercise recovery. Penetrates deep into tissue to reduce inflammation and restore mobility. Used in Iyka-Aram's physiotherapy protocols.",
    benefits: [
      "Reduces DOMS (delayed onset muscle soreness)",
      "Improves circulation to sore tissue",
      "Eases joint stiffness",
      "Fast-absorbing, non-greasy",
    ],
    ingredients:
      "Wintergreen EO, Camphor, Eucalyptus EO, Clove EO, Arnica extract in Sesame & Coconut oil base",
    usage:
      "Apply a small amount to sore muscles or joints. Massage with firm, circular strokes for 5–10 minutes. Can be used with warm towel compress. Avoid on broken skin. Wash hands after use.",
    inStock: true,
    rating: 4.7,
    reviews: 112,
  },
  {
    slug: "wellness-gift-box",
    name: "IYKA Wellness Gift Box",
    tagline: "A curated ritual — the perfect gift for someone healing",
    price: 2499,
    mrp: 3200,
    category: "Gifts",
    img: "/products/gift-box.jpg",
    size: "Curated set",
    description:
      "A luxury gift set featuring four of our most-loved products, beautifully packaged in a hand-crafted box with a personalised wellness card. Ideal for gifting to someone you love — or yourself.",
    benefits: [
      "Includes 4 full-size products",
      "Hand-crafted gift packaging",
      "Personalised wellness card",
      "Free delivery on gift boxes",
    ],
    ingredients: "Includes: Stress Relief Roll-On, Aloe Vera Gel, Herbal Soap, and Aura Bath Salt",
    usage: "Includes individual usage instructions for each product. Scan the QR code inside for video guides.",
    inStock: true,
    rating: 5.0,
    reviews: 67,
    badge: "Gift Ready",
  },
];

export const categories = ["All", "Hair Care", "Skin Care", "Wellness", "Yoga", "Gifts"];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
