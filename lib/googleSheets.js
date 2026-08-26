import { google } from "googleapis";

// Reads a Google service account credential from env vars and appends a
// row to the configured sheet. Set these in .env.local:
//   GOOGLE_SHEET_ID=...
//   GOOGLE_SERVICE_ACCOUNT_EMAIL=...
//   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
// (share the sheet with the service account email, Editor access)
export async function appendRegistrationRow(row) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId || !email || !key) {
    console.warn("[google sheets] Missing GOOGLE_SHEET_ID / GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY — skipping sheet write.");
    return { skipped: true };
  }

  // GoogleAuth + getClient() is the current recommended pattern — directly
  // instantiating google.auth.JWT and handing it to google.sheets() without
  // an explicit authorize/getClient step is what caused the "missing
  // required authentication credential" error (the request went out with
  // no Authorization header attached).
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const HEADER = ["Name", "Email", "Phone", "College", "Ticket ID", "Timestamp"];

  // If the sheet has no header row yet (brand new / blank sheet), write one
  // before appending the first data row.
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sheet1!A1:F1",
  });

  if (!existing.data.values || existing.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "Sheet1!A1:F1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [HEADER] },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });

  return { skipped: false };
}