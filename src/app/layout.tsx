import type { Metadata } from "next";
import { Fraunces, Inter, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { business } from "@/content/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

// Astro landing design system fonts
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Clinical wellness in Northeast India. Functional Medicine, Yoga & Naturopathy — drugless, integrative healthcare in Meghalaya.";

export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: "IYKA-ARAM Wellness — Drugless Healthcare in Meghalaya",
    template: "%s · IYKA-ARAM Wellness",
  },
  description,
  keywords: [
    "functional medicine",
    "naturopathy",
    "yoga",
    "drugless healthcare",
    "integrative health",
    "wellness Meghalaya",
    "Northeast India wellness",
    "AYUSH",
  ],
  openGraph: {
    title: "IYKA-ARAM Wellness — Drugless Healthcare in Meghalaya",
    description,
    url: business.url,
    siteName: business.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IYKA-ARAM Wellness",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
