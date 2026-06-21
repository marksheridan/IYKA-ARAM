import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "IYKA-ARAM Wellness — Drugless Healthcare in Meghalaya";

// Social-share card shown when the site is linked on WhatsApp, etc.
// Typographic for now; can be replaced with a branded photo later.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2f4733 0%, #1c1b17 100%)",
          color: "#faf7f0",
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        <div
          style={{
            color: "#c2a14d",
            fontSize: 26,
            letterSpacing: 10,
            textTransform: "uppercase",
          }}
        >
          Wellness Starts Here
        </div>
        <div style={{ fontSize: 110, fontWeight: 700, marginTop: 16 }}>
          IYKA-ARAM
        </div>
        <div style={{ fontSize: 32, color: "#efe9dc", marginTop: 16 }}>
          Functional Medicine · Yoga &amp; Naturopathy · Meghalaya
        </div>
      </div>
    ),
    { ...size },
  );
}
