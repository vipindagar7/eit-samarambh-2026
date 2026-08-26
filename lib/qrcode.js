import QRCode from "qrcode";

// Generates a QR code as a PNG Buffer (for emailing as an inline attachment)
// and as a base64 data URL (for the browser to show/download immediately
// after registration, without waiting on the email to arrive).
export async function generateQr(text) {
  const buffer = await QRCode.toBuffer(text, {
    width: 480,
    margin: 2,
    color: { dark: "#1a0b2e", light: "#fdf6ec" },
  });
  const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  return { buffer, dataUrl };
}