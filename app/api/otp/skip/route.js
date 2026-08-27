import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { finalizeRegistration } from "@/lib/registerUser";

// Called when the user has exhausted every OTP attempt on both channels
// and chooses to proceed without verification. The registration still
// goes through (QR, email, WhatsApp) but is logged as unverified — into
// its own "Unverified" tab in the sheet, and flagged in MongoDB — so the
// team can follow up manually if needed.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { token } = body || {};
  if (!token) {
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

  const result = await finalizeRegistration(session.formData, { verified: false });

  if (result.error) {
    return NextResponse.json({ error: result.error, details: result.details }, { status: result.status || 502 });
  }

  await collection.updateOne({ token }, { $set: { verified: true, skippedVerification: true } });

  return NextResponse.json(result);
}