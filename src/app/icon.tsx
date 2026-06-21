import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Branded favicon — gold "I" mark on forest green. Swap for the real logo
// (drop an icon.png / favicon.ico in src/app to override).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2f4733",
          color: "#c2a14d",
          fontSize: 22,
          fontWeight: 700,
          borderRadius: 6,
        }}
      >
        I
      </div>
    ),
    { ...size },
  );
}
