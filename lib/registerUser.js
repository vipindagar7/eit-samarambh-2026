import { randomUUID } from "crypto";
import { getDb } from "@/lib/mongodb";
import { appendRegistrationRow } from "@/lib/googleSheets";
import { generateQr } from "@/lib/qrcode";
import { sendTicketEmail } from "@/lib/mailer";
import { sendWhatsappPass } from "@/lib/smsNotifications";

// Shared "finalize a registration" logic — writes to MongoDB + Google
// Sheets, generates the QR, and emails/WhatsApps the pass. Called once OTP
// verification succeeds (see app/api/otp/verify/route.js), or when a user
// opts to skip OTP verification entirely after exhausting all attempts
// (see app/api/otp/skip/route.js) — in that case pass { verified: false }
// and the entry goes to a separate "Unverified" tab in the sheet instead
// of the normal one, and gets a matching flag in MongoDB.
export async function finalizeRegistration(data, { verified = true } = {}) {
  const { studentType, name, email, phone, college, passingYear, profession, transport } = data;

  const ticketId = randomUUID().slice(0, 8).toUpperCase();

  const registration = {
    ticketId,
    studentType: String(studentType).trim(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    phone: String(phone).trim(),
    college: college ? String(college).trim() : "",
    passingYear: passingYear ? String(passingYear).trim() : "",
    profession: profession ? String(profession).trim() : "",
    transport: transport ? String(transport).trim() : "",
    otpVerified: verified,
    createdAt: new Date(),
  };

  const results = { mongo: null, sheet: null, email: null, whatsapp: null };

  // Write to MongoDB — duplicate check first, unique index as a second guard
  try {
    const db = await getDb();
    const collection = db.collection("registrations");

    await collection.createIndex({ email: 1 }, { unique: true }).catch(() => {});
    await collection.createIndex({ phone: 1 }, { unique: true }).catch(() => {});

    const existing = await collection.findOne({
      $or: [{ email: registration.email }, { phone: registration.phone }],
    });

    if (existing) {
      const field = existing.email === registration.email ? "email" : "phone";
      return {
        error:
          field === "email"
            ? "This email is already registered."
            : "This phone number is already registered.",
        status: 409,
      };
    }

    try {
      const result = await collection.insertOne(registration);
      results.mongo = { insertedId: result.insertedId };
    } catch (err) {
      if (err.code === 11000) {
        const field = err.message.includes("email") ? "email" : "phone";
        return {
          error:
            field === "email"
              ? "This email is already registered."
              : "This phone number is already registered.",
          status: 409,
        };
      }
      throw err;
    }
  } catch (err) {
    console.error("[registerUser] MongoDB write failed:", err.message);
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
      registration.passingYear || registration.profession, // one column, whichever applies
      registration.ticketId,
      registration.createdAt.toISOString(),
      registration.transport,
    ];
    results.sheet = await appendRegistrationRow(row, verified ? "Sheet1" : "Unverified");
  } catch (err) {
    console.error("[registerUser] Google Sheets write failed:", err.message);
    results.sheet = { error: err.message };
  }

  // Generate QR + email the pass
  let qrDataUrl = null;
  try {
    const { buffer, dataUrl } = await generateQr(ticketId);
    qrDataUrl = dataUrl;

    results.email = await sendTicketEmail({
      to: registration.email,
      name: registration.name,
      ticketId,
      qrBuffer: buffer,
    });

    results.whatsapp = await sendWhatsappPass(registration.phone, { ticketId, name: registration.name });
  } catch (err) {
    console.error("[registerUser] QR/email step failed:", err.message);
    results.email = { error: err.message };
  }

  const mongoOk = results.mongo && !results.mongo.error;
  const sheetOk = results.sheet && !results.sheet.error;

  if (!mongoOk && !sheetOk) {
    return {
      error: "Couldn't save your registration. Please try again shortly.",
      status: 502,
      details: results,
    };
  }

  return { ok: true, ticketId, qrDataUrl, ...results };
}