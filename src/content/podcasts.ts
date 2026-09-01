/**
 * IYKA-ARAM — The Wellness Podcast.
 *
 * Single source of truth for every episode: the vertical teaser that plays on
 * the homepage, the full YouTube episode on the inside page, and the writing
 * that sits under it. Add a new object to the top of `podcasts` and the
 * homepage row, the /podcast listing and the sitemap all pick it up.
 *
 * Every episode below is a real one from youtube.com/@IYKA-ARAM — ids,
 * titles, guests, runtimes and dates were taken from the channel.
 *
 * Filling in a new episode
 * ───────────────────────
 *  youtubeId  Only the id, not the whole URL. From
 *             https://www.youtube.com/watch?v=izdG_13Zf5E  →  "izdG_13Zf5E"
 *             Leave "" until the episode is uploaded — the player shows a
 *             tidy "coming soon" panel instead of a broken frame.
 *  teaser     The vertical (9:16) short for the episode. Drop the file into
 *             /public/videos/podcasts/ and point here. "" is fine — the card
 *             falls back to a branded panel with the episode number.
 *  poster     First frame of the teaser. Optional; it is what shows before
 *             the clip decodes and on slow connections.
 *  guestRole  Optional. Printed after the guest name on the episode page;
 *             leave "" when the title isn't confirmed.
 *  body       Plain paragraphs. One string per paragraph.
 *  takeaways  Optional bullet list. [] hides the block entirely.
 *
 * TO DO — the `summary`, `body` and `takeaways` below are short factual stubs
 * written from the episode titles, not from the conversations themselves.
 * Replace them with real show notes; every page is already built for them.
 */

export type PodcastLink = {
  label: string;
  href: string;
};

export type Podcast = {
  slug: string;
  episode: number;
  title: string;
  /** One line under the title on the cards — keep it under ~90 characters. */
  blurb: string;
  guest: string;
  /** Optional — omitted from the page when "". */
  guestRole: string;
  /** ISO date, used for sorting and for the printed date. */
  publishedAt: string;
  /** Human-readable runtime, e.g. "56 min". */
  duration: string;
  /** YouTube video id only. "" until the full episode is published. */
  youtubeId: string;
  /** Vertical 9:16 teaser clip. "" falls back to the poster, then to a panel. */
  teaser: string;
  /** Still frame for the teaser card. */
  poster: string;
  /**
   * Seconds into the teaser to freeze on for the card thumbnail. The opening
   * frame of a talking-head clip usually catches someone mid-word, so nudge
   * this until the still looks right. Ignored when `poster` is set.
   */
  posterTime?: number;
  /**
   * Scale for a short that came with black bars padded into the frame —
   * 1.12 crops roughly 6% off each edge. Leave unset for a clean 9:16 clip.
   */
  zoom?: number;
  topics: string[];
  /** Standfirst on the episode page. */
  summary: string;
  /** Body copy — one string per paragraph. */
  body: string[];
  /** Pull-out list rendered as "What you'll take away". [] hides it. */
  takeaways: string[];
  /** Optional off-site players. Omit any the show is not on yet. */
  links?: PodcastLink[];
};

export const podcastMeta = {
  showName: "The Wellness Podcast",
  tagline: "Where science meets tradition",
  /* The channel's own description of the show, trimmed. */
  description:
    "Conversations with healthcare professionals, wellness experts and inspiring individuals on preventive healthcare, yoga, nutrition, mental wellbeing, lifestyle medicine and holistic healing — simple, evidence-based practices for a healthier, more balanced life.",
  youtubeChannel: "https://www.youtube.com/@IYKA-ARAM",
};

export const podcasts: Podcast[] = [
  {
    slug: "ep-4-adhd",
    episode: 4,
    title: "ADHD",
    blurb: "Understanding attention-deficit/hyperactivity disorder.",
    guest: "Dr. Aditi Garg",
    guestRole: "",
    publishedAt: "2026-08-03",
    duration: "56 min",
    youtubeId: "izdG_13Zf5E",
    teaser: "/videos/podcasts/ep-4-adhd.mp4",
    poster: "",
    /* This short is padded top and bottom — crop the bars out. */
    zoom: 1.12,
    posterTime: 23.3,
    topics: ["ADHD", "Mental Wellbeing"],
    summary:
      "Episode 4 of The Wellness Podcast: Dr. Aditi Garg joins us for a conversation about ADHD.",
    body: [
      "Dr. Aditi Garg sits down with the IYKA-ARAM team to talk through ADHD — what it is, how it is recognised, and what support looks like beyond a prescription.",
      "The full episode is above. New conversations land on the IYKA-ARAM YouTube channel.",
    ],
    takeaways: [],
  },
  {
    slug: "ep-3-neuroscience-and-integrative-wellness",
    episode: 3,
    title: "Neuroscience & Integrative Wellness",
    blurb: "Where brain science meets integrative practice.",
    guest: "Dr. Bhavit Bansal",
    guestRole: "",
    publishedAt: "2026-06-26",
    duration: "82 min",
    youtubeId: "rLyAQtAogHE",
    teaser: "/videos/podcasts/ep-3-neuroscience.mp4",
    poster: "",
    posterTime: 34.1,
    topics: ["Neuroscience", "Integrative Care"],
    summary:
      "Episode 3 of The Wellness Podcast: Dr. Bhavit Bansal on neuroscience and integrative wellness — the longest conversation the show has run.",
    body: [
      "Dr. Bhavit Bansal joins the IYKA-ARAM team to talk about what neuroscience contributes to integrative wellness, and where the two ways of working meet.",
      "The full episode is above. New conversations land on the IYKA-ARAM YouTube channel.",
    ],
    takeaways: [],
  },
  {
    slug: "ep-2-menopause",
    episode: 2,
    title: "Menopause",
    blurb: "What changes, and what helps.",
    guest: "Dr. Jupirika Pyrbot",
    guestRole: "",
    publishedAt: "2026-03-14",
    duration: "20 min",
    youtubeId: "NZQ8NdH2owg",
    teaser: "/videos/podcasts/ep-2-menopause.mp4",
    poster: "",
    posterTime: 0.5,
    topics: ["Menopause", "Women's Health"],
    summary:
      "Episode 2 of The Wellness Podcast: Dr. Jupirika Pyrbot on menopause — a short, direct conversation about a stage of life that rarely gets one.",
    body: [
      "Dr. Jupirika Pyrbot joins the IYKA-ARAM team to talk about menopause: what changes, what is worth paying attention to, and what genuinely helps.",
      "The full episode is above. New conversations land on the IYKA-ARAM YouTube channel.",
    ],
    takeaways: [],
  },
  {
    slug: "ep-1-chronic-stress",
    episode: 1,
    title: "Chronic Stress",
    blurb: "The first episode — what long-term stress does to the body.",
    guest: "Dr. Baiakmenlang Synmon",
    guestRole: "",
    publishedAt: "2026-01-29",
    duration: "36 min",
    youtubeId: "3a9lIJI7Fzs",
    teaser: "/videos/podcasts/ep-1-chronic-stress.mp4",
    poster: "",
    posterTime: 36.1,
    topics: ["Chronic Stress", "Mental Wellbeing"],
    summary:
      "The episode that started the show: Dr. Baiakmenlang Synmon on chronic stress and what it does to the body over time.",
    body: [
      "Dr. Baiakmenlang Synmon joins the IYKA-ARAM team for the first episode of The Wellness Podcast, on chronic stress — how it builds, what it costs, and what can be done about it.",
      "The full episode is above. New conversations land on the IYKA-ARAM YouTube channel.",
    ],
    takeaways: [],
  },
];

/** Newest first — the order the homepage row and the listing page use. */
export function getPodcasts(): Podcast[] {
  return [...podcasts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPodcast(slug: string): Podcast | undefined {
  return podcasts.find((p) => p.slug === slug);
}
