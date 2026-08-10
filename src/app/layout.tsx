import type { Metadata } from "next";
import { Inter, DM_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { business } from "@/content/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* Body face. Italic is loaded because Bricolage has none — anything that
   needs a real italic (pull quotes, attributions) uses this instead. */
const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Display face for every heading, site and store. See --font-display.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${inter.variable} ${dmSans.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
