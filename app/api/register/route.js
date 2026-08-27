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

  const { studentType, name, email, phone, college, passingYear } = body || {};

  if (!studentType || !name || !email || !phone || !college || !passingYear) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const ticketId = randomUUID().slice(0, 8).toUpperCase();

  const registration = {
    ticketId,
    studentType: String(studentType).trim(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    phone: String(phone).trim(),
    college: String(college).trim(),
    passingYear: String(passingYear).trim(),
    createdAt: new Date(),
  };

  const results = { mongo: null, sheet: null, email: null };

  // Write to MongoDB — check for an existing registration with the same
  // email or phone first, and rely on unique indexes as a second guard
  // against two requests racing each other at the exact same moment.
  try {
    const db = await getDb();
    const collection = db.collection("registrations");

    // best-effort — if this fails (e.g. index already exists differently)
    // the duplicate check below still catches most real-world cases
    await collection.createIndex({ email: 1 }, { unique: true }).catch(() => {});
    await collection.createIndex({ phone: 1 }, { unique: true }).catch(() => {});

    const existing = await collection.findOne({
      $or: [{ email: registration.email }, { phone: registration.phone }],
    });

    if (existing) {
      const field = existing.email === registration.email ? "email" : "phone";
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

    try {
      const result = await collection.insertOne(registration);
      results.mongo = { insertedId: result.insertedId };
    } catch (err) {
      // duplicate key error from the unique index (race condition between
      // two near-simultaneous submissions with the same email/phone)
      if (err.code === 11000) {
        const field = err.message.includes("email") ? "email" : "phone";
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
      throw err;
    }
  } catch (err) {
    console.error("[api/register] MongoDB write failed:", err.message);
    results.mongo = { error: err.message };
  }

  // Append to Google Sheet
  try {
    const row = [
      registration.studentType,
      registration.name,
      registration.email,
      registration.phone,
      registration.college,
      registration.passingYear,
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