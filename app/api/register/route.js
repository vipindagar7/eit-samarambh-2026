import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { appendRegistrationRow } from "@/lib/googleSheets";
import { generateQr } from "@/lib/qrcode";
import { sendTicketEmail } from "@/lib/mailer";

// Visiting this URL directly in a browser sends a GET request — this just
// confirms the endpoint is alive. The actual registration form sends a POST.
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "This endpoint is live. It only accepts POST requests from the registration form — visiting it directly (GET) doesn't do anything.",
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, phone, college } = body || {};

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const ticketId = randomUUID().slice(0, 8).toUpperCase();

  const registration = {
    ticketId,
    name: String(name).trim(),
    email: String(email).trim(),
    phone: phone ? String(phone).trim() : "",
    college: college ? String(college).trim() : "",
    createdAt: new Date(),
  };

  const results = { mongo: null, sheet: null, email: null };

  // Write to MongoDB
  try {
    const db = await getDb();
    const result = await db.collection("registrations").insertOne(registration);
    results.mongo = { insertedId: result.insertedId };
  } catch (err) {
    console.error("[api/register] MongoDB write failed:", err.message);
    results.mongo = { error: err.message };
  }

  // Append to Google Sheet
  try {
    const row = [
      registration.name,
      registration.email,
      registration.phone,
      registration.college,
      registration.ticketId,
      registration.createdAt.toISOString(),
    ];
    results.sheet = await appendRegistrationRow(row);
  } catch (err) {
    console.error("[api/register] Google Sheets write failed:", err.message);
    results.sheet = { error: err.message };
  }

  // Generate the QR code — encodes just the ticket ID so it can be
  // scanned/verified at entry
  let qrDataUrl = null;
  try {
    const { buffer, dataUrl } = await generateQr(ticketId);
    qrDataUrl = dataUrl;

    // Send the confirmation email with the QR embedded, but don't let a
    // failed/unconfigured email block the registration itself
    results.email = await sendTicketEmail({
      to: registration.email,
      name: registration.name,
      ticketId,
      qrBuffer: buffer,
    });
  } catch (err) {
    console.error("[api/register] QR/email step failed:", err.message);
    results.email = { error: err.message };
  }

  // Succeed as long as at least one storage target worked — don't block the
  // user's registration just because one integration isn't configured yet.
  const mongoOk = results.mongo && !results.mongo.error;
  const sheetOk = results.sheet && !results.sheet.error;

  if (!mongoOk && !sheetOk) {
    return NextResponse.json(
      { error: "Couldn't save your registration. Please try again shortly.", details: results },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, ticketId, qrDataUrl, ...results });
}