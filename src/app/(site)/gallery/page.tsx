import type { Metadata } from "next";
import { GalleryClient } from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery — Iyka-Aram Wellness & Healthcare",
  description:
    "A visual journey through Iyka-Aram — our clinic, yoga sessions, community events, wellness products and the people behind Northeast India's first functional medicine startup.",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
