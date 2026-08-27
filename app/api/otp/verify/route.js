import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { finalizeRegistration } from "@/lib/registerUser";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { token, otp } = body || {};
  if (!token || !otp) {
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
  if (Date.now() > session.otpExpiresAt) {
    return NextResponse.json({ error: "That code has expired. Request a new one." }, { status: 400 });
  }
  if (String(otp).trim() !== session.otp) {
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
  }

  // Correct code — finalize the actual registration now
  const result = await finalizeRegistration(session.formData);

  if (result.error) {
    return NextResponse.json({ error: result.error, details: result.details }, { status: result.status || 502 });
  }

  await collection.updateOne({ token }, { $set: { verified: true } });

  return NextResponse.json(result);
}