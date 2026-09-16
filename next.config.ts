import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Next 16 refuses dev-server requests for /_next/* that arrive from a host
     other than localhost, which is right by default. It also means opening the
     dev server on the LAN — to check the site on a phone — serves the HTML but
     403s the CSS and JS, so the page renders unstyled and looks broken.

     Listing the LAN host restores that. Development only: `next start` does not
     apply this check, so production is unaffected. */
  allowedDevOrigins: ["192.168.1.18"],

  /* Hides the floating "N" dev-tools badge that sits over the bottom-left of
     the page. It never appears in production, but it covers the corner of the
     hero when reviewing the design. Compile and runtime errors are still
     surfaced with this off. */
  devIndicators: false,
};

export default nextConfig;
