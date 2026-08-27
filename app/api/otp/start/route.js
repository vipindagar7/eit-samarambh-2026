import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/mongodb";
import { generateOtp, OTP_TTL_MS, RESEND_WAIT_SECONDS } from "@/lib/otp";
import { sendSmsOtp } from "@/lib/smsNotifications";

// Starts a new OTP verification session for a registration attempt.
// Stores the (not-yet-saved) form data alongside the OTP so verify/route.js
// can finalize the actual registration once the code is confirmed.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { studentType, name, email, phone, college, passingYear } = body || {};

  if (!studentType || !name || !email || !phone || !college || !passingYear) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const formData = {
    studentType: String(studentType).trim(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    phone: String(phone).trim(),
    college: String(college).trim(),
    passingYear: String(passingYear).trim(),
  };

  // Check for an already-registered email/phone BEFORE sending any OTP —
  // no point making someone go through verification just to find out at
  // the end that they're already registered.
  try {
    const db = await getDb();
    const existing = await db.collection("registrations").findOne({
      $or: [{ email: formData.email }, { phone: formData.phone }],
    });
    if (existing) {
      const field = existing.email === formData.email ? "email" : "phone";
      return NextResponse.json(
        {
          error:
            field === "email"
              ? "This email is already registered."
              : "This phone number is already registered.",
        },
        { status: 409 }
      );
    }
  } catch (err) {
    console.error("[api/otp/start] duplicate check failed:", err.message);
    // don't block the flow just because the check itself failed — the
    // same uniqueness guard still runs again at finalize time
  }

  const token = randomUUID();
  const otp = generateOtp();
  const now = Date.now();

  const session = {
    token,
    formData,
    channel: "mobile",
    otp,
    otpExpiresAt: now + OTP_TTL_MS,
    mobileAttempts: 1,
    emailAttempts: 0,
    verified: false,
    createdAt: new Date(now),
    // TTL index cleans these up automatically well after they're useless
    expireAt: new Date(now + 30 * 60 * 1000),
  };

  try {
    const db = await getDb();
    const collection = db.collection("otp_sessions");
    await collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
    await collection.insertOne(session);
  } catch (err) {
    console.error("[api/otp/start] failed to create OTP session:", err.message);
    return NextResponse.json({ error: "Couldn't start verification. Please try again." }, { status: 502 });
  }

  let mobileSendOk = true;
  try {
    await sendSmsOtp(session.formData.phone, otp);
  } catch (err) {
    console.warn("[api/otp/start] SMS OTP send failed (falling back to email offer):", err.message);
    mobileSendOk = false;
  }

  return NextResponse.json({
    token,
    channel: "mobile",
    mobileSendOk,
    waitSeconds: RESEND_WAIT_SECONDS,
  });
}