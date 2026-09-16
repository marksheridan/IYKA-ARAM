import type { MetadataRoute } from "next";
import { business } from "@/content/site";
import { COMING_SOON } from "@/lib/launch";

const LIVE_ROUTES = [
  "",
  "/about",
  "/services",
  "/products",
  "/contact",
  "/podcast",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = business.url;

  // Pre-launch there is one page worth indexing. Listing the rest would point
  // search engines at URLs that only redirect back to the splash.
  const routes = COMING_SOON ? [""] : LIVE_ROUTES;

  return routes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
