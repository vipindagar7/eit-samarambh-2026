import { google } from "googleapis";

// Reads a Google service account credential from env vars and appends a
// row to the configured sheet. Set these in .env.local:
//   GOOGLE_SHEET_ID=...
//   GOOGLE_SERVICE_ACCOUNT_EMAIL=...
//   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
// (share the sheet with the service account email, Editor access)
// Reads a Google service account credential from env vars and appends a
// row to the configured sheet. Set these in .env.local:
//   GOOGLE_SHEET_ID=...
//   GOOGLE_SERVICE_ACCOUNT_EMAIL=...
//   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
// (share the sheet with the service account email, Editor access)
//
// `sheetName` picks which tab to write to — defaults to "Sheet1" (verified
// registrations). Pass "Unverified" to log a registration that skipped OTP
// verification into its own separate tab instead.
export async function appendRegistrationRow(row, sheetName = "Sheet1") {
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

  const HEADER = ["Student Type", "Name", "Email", "Phone", "Institute", "12th Passing Year", "Ticket ID", "Timestamp"];

  // Make sure the target tab actually exists — the spreadsheet only has
  // "Sheet1" by default, so "Unverified" needs to be created the first
  // time anything tries to write to it.
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const tabExists = spreadsheet.data.sheets?.some((s) => s.properties?.title === sheetName);

  if (!tabExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });
  }

  // If the tab has no header row yet (brand new), write one before
  // appending the first data row.
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!A1:H1`,
  });

  if (!existing.data.values || existing.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:H1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [HEADER] },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheetName}!A:H`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });

  return { skipped: false };
}