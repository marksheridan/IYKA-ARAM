import type { MetadataRoute } from "next";
import { business } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = business.url;
  const routes = ["", "/about", "/services", "/products", "/contact", "/booking"];
  return routes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
