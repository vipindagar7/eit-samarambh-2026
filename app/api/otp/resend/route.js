import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { generateOtp, OTP_TTL_MS, RESEND_WAIT_SECONDS, MAX_ATTEMPTS_PER_CHANNEL } from "@/lib/otp";
import { sendSmsOtp } from "@/lib/smsNotifications";
import { sendOtpEmail } from "@/lib/mailer";

// Resends the OTP, either on the same channel or switching to email (the
// fallback offered once the mobile wait window runs out).
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { token, channel } = body || {};
  if (!token || !["mobile", "email"].includes(channel)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = await getDb();
  const collection = db.collection("otp_sessions");
  const session = await collection.findOne({ token });

  if (!session) {
    return NextResponse.json({ error: "Session expired. Please start over." }, { status: 404 });
  }
  if (session.verified) {
    return NextResponse.json({ error: "Already verified." }, { status: 400 });
  }

  const attemptsField = channel === "mobile" ? "mobileAttempts" : "emailAttempts";
  const currentAttempts = session[attemptsField] || 0;

  if (currentAttempts >= MAX_ATTEMPTS_PER_CHANNEL) {
    return NextResponse.json(
      { error: `No more ${channel} attempts left.`, attemptsExhausted: true },
      { status: 429 }
    );
  }

  const otp = generateOtp();
  const now = Date.now();

  await collection.updateOne(
    { token },
    {
      $set: {
        channel,
        otp,
        otpExpiresAt: now + OTP_TTL_MS,
      },
      $inc: { [attemptsField]: 1 },
    }
  );

  let sendOk = true;
  if (channel === "mobile") {
    try {
      await sendSmsOtp(session.formData.phone, otp);
    } catch (err) {
      console.warn("[api/otp/resend] SMS OTP send failed:", err.message);
      sendOk = false;
    }
  } else {
    const result = await sendOtpEmail({ to: session.formData.email, name: session.formData.name, otp });
    sendOk = result.sent;
  }

  return NextResponse.json({
    channel,
    sendOk,
    waitSeconds: RESEND_WAIT_SECONDS,
    attemptsLeft: MAX_ATTEMPTS_PER_CHANNEL - (currentAttempts + 1),
  });
}