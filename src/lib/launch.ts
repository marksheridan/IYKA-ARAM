/**
 * Pre-launch holding page.
 *
 * With COMING_SOON="true" the site serves a single "launching soon" splash at
 * / and sends every other public route back to it. The booking pop-up stays
 * live throughout — the point of a holding page is still to capture enquiries,
 * and that path needs no database.
 *
 * Read at build time, since / is statically prerendered. Changing the flag
 * means a rebuild, which is exactly what deploy/deploy.sh does.
 */
export const COMING_SOON = process.env.COMING_SOON === "true";

/** Public routes that the holding page stands in for. */
export const PRE_LAUNCH_HIDDEN = [
  "/about",
  "/services",
  "/products",
  "/gallery",
  "/podcast",
  "/contact",
];
