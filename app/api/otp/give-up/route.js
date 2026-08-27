import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendAdminFallbackEmail } from "@/lib/mailer";

// Called when the frontend has exhausted every OTP attempt on both
// channels. Notifies the admin inbox (cc'd to the registrant) so someone
// can follow up and register them manually.
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
    return NextResponse.json({ error: "Session expired." }, { status: 404 });
  }

  const result = await sendAdminFallbackEmail(session.formData);
  await collection.updateOne({ token }, { $set: { gaveUp: true } });

  return NextResponse.json({ ok: true, notified: result.sent });
}