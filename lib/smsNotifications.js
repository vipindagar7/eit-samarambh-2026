import axios from "axios";

export async function sendSmsOtp(phone, code) {
  const message = `Thank you for registering. Your OTP is ${code}. Echelon Institute of Technology! visit www.eitfaridabad.com or call +919999753763 for more updates..`;

  try {
    const response = await axios.get("http://bulksms.saakshisoftware.in/api/mt/SendSMS", {
      params: {
        user: process.env.SMS_USER,
        password: process.env.SMS_PASS,
        senderid: process.env.SENDER_ID,
        channel: "Trans",
        DCS: 0,
        flashsms: 0,
        number: `91${phone}`,
        text: message,
        route: 4,
      },
    });
    console.log("SMS Response:", response.data);
    return { success: true, message: "OTP sent." };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("SMS Error:", errMessage);
    throw new Error(errMessage || "Failed to send OTP");
  }
}

async function uploadWhatsappMedia(buffer, filename, headers) {
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: "image/png" }), filename);

  const res = await fetch("https://wa.apimis.in/api/v1/whatsapp/media/uploads", {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    console.error("[whatsapp] media upload failed:", JSON.stringify(errBody, null, 2));
    throw new Error(errBody.detail || errBody.title || `Media upload failed (${res.status})`);
  }

  const data = await res.json();
  console.log("[whatsapp] media upload response:", data);
  return data.id || data.mediaId || data.data?.id;
}

export async function sendWhatsappPass(phone, { ticketId, name }) {
  if (!process.env.WHATSAPP_API_KEY) {
    console.warn("[whatsapp] WHATSAPP_API_KEY not set — skipping WhatsApp send.");
    return { sent: false, skipped: true };
  }
  if (!process.env.WHATSAPP_TEMPLATE_NAME) {
    console.warn(
      "[whatsapp] WHATSAPP_TEMPLATE_NAME not set — add the exact registered template name from WhatsApp Business Manager to .env.local. Skipping WhatsApp send for now."
    );
    return { sent: false, skipped: true };
  }
  if (!process.env.WHATSAPP_PHONE_ID) {
    console.warn("[whatsapp] WHATSAPP_PHONE_ID not set — required by this account. Skipping.");
    return { sent: false, skipped: true };
  }

  const authHeaders = {
    Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
    "x-phone-id": process.env.WHATSAPP_PHONE_ID,
  };

  try {
    const { generateQr } = await import("@/lib/qrcode");
    const { buffer } = await generateQr(ticketId);
    const mediaId = await uploadWhatsappMedia(buffer, `${ticketId}.png`, authHeaders);

    if (!mediaId) {
      throw new Error("Media upload didn't return an id — check the logged response shape above.");
    }

    const res = await fetch("https://wa.apimis.in/api/v1/whatsapp/meta/sendMessage", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          type: "template",
          template: {
            name: process.env.WHATSAPP_TEMPLATE_NAME,
            language: { code: "en" },
            components: [
              {
                type: "header",
                parameters: [{ type: "image", image: { id: mediaId } }],
              },
            ],
          },
        },
        to: `91${phone}`,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("[whatsapp] full error response:", JSON.stringify(errBody, null, 2));
      const detail =
        errBody?.error?.error_data?.details || errBody?.error?.message || errBody.detail || errBody.title;
      throw new Error(detail || `WhatsApp send failed (${res.status})`);
    }

    const data = await res.json().catch(() => ({}));
    console.log("[whatsapp] sent:", data);
    return { sent: true };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("[whatsapp] sendWhatsappPass failed:", errMessage);
    return { sent: false, error: errMessage };
  }
}
