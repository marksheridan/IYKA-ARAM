const OTP_SECRET = process.env.OTP_SECRET || "iyka-aram-otp-secret-dev";
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER;

async function hmac(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    console.log(`[DEV] OTP SMS to ${to}: ${body}`);
    return true;
  }
  const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: TWILIO_FROM, To: to, Body: body }),
    }
  );
  return res.ok;
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone || !/^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ""))) {
      return Response.json({ error: "Invalid phone number." }, { status: 400 });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const exp = Date.now() + 10 * 60 * 1000;
    const payload = JSON.stringify({ phone, otp, exp });
    const sig = await hmac(OTP_SECRET, payload);
    const token = btoa(payload) + "." + sig;
    const sent = await sendSMS(
      phone.startsWith("+") ? phone : `+91${phone.replace(/^0/, "")}`,
      `Your IYKA Living OTP is ${otp}. Valid for 10 minutes. Do not share this with anyone.`
    );
    if (!sent) {
      return Response.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
    }
    return Response.json({ token, maskedPhone: phone.slice(-4) });
  } catch {
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}
