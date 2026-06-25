const OTP_SECRET = process.env.OTP_SECRET || "iyka-aram-otp-secret-dev";

async function hmac(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function POST(request: Request) {
  try {
    const { token, otp } = await request.json();
    if (!token || !otp) {
      return Response.json({ verified: false, error: "Missing token or OTP." }, { status: 400 });
    }
    const [payloadB64, sig] = token.split(".");
    const payload = atob(payloadB64);
    const expectedSig = await hmac(OTP_SECRET, payload);
    if (sig !== expectedSig) {
      return Response.json({ verified: false, error: "Invalid token." }, { status: 400 });
    }
    const { otp: storedOtp, exp } = JSON.parse(payload);
    if (Date.now() > exp) {
      return Response.json({ verified: false, error: "OTP has expired. Please request a new one." }, { status: 400 });
    }
    if (otp.trim() !== storedOtp) {
      return Response.json({ verified: false, error: "Incorrect OTP. Please try again." }, { status: 400 });
    }
    return Response.json({ verified: true });
  } catch {
    return Response.json({ verified: false, error: "Server error." }, { status: 500 });
  }
}
