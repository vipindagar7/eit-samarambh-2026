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
async function uploadWhatsappMedia(
  buffer,
  filename,
  headers
) {
  const form = new FormData();

  form.append("messaging_product", "whatsapp");
  form.append("mediaUse", "OUT");

  const blob = new Blob([buffer], {
    type: "image/png",
  });

  form.append("file", blob, filename);

  const response = await fetch(
    "https://wa.apimis.in/api/v1/whatsapp/media/upload",
    {
      method: "POST",
      headers,
      body: form,
    }
  );

  const raw = await response.text();

  console.log("[APIMIS MEDIA STATUS]", response.status);
  console.log("[APIMIS MEDIA RESPONSE]", raw);

  if (!response.ok) {
    throw new Error(
      `APIMIS media upload failed (${response.status}): ${raw}`
    );
  }

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      `APIMIS returned non-JSON media response: ${raw}`
    );
  }

  const mediaId =
    data?.metaMediaId ??
    data?.mediaId ??
    data?.id ??
    data?.data?.metaMediaId;

  if (!mediaId) {
    throw new Error(
      `Media uploaded but no media ID found. Response: ${raw}`
    );
  }

  return mediaId;
}

export async function sendWhatsappPass(
  phone,
  {
    ticketId,
    name,
  }
) {
  const apiKey = process.env.WHATSAPP_API_KEY;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!apiKey) {
    throw new Error("WHATSAPP_API_KEY is missing");
  }

  if (!templateName) {
    throw new Error("WHATSAPP_TEMPLATE_NAME is missing");
  }

  if (!phoneId) {
    throw new Error("WHATSAPP_PHONE_ID is missing");
  }

  /*
   * Normalize phone number.
   *
   * Examples:
   * 8802778922       -> 918802778922
   * 918802778922     -> 918802778922
   * +918802778922    -> 918802778922
   */
  let whatsappNumber = phone.replace(/\D/g, "");

  if (whatsappNumber.startsWith("0")) {
    whatsappNumber = whatsappNumber.substring(1);
  }

  if (!whatsappNumber.startsWith("91")) {
    whatsappNumber = `91${whatsappNumber}`;
  }

  const authHeaders = {
    Authorization: `Bearer ${apiKey}`,
    "x-phone-id": phoneId,
  };

  try {
    /*
     * 1. Generate QR
     */
    const { generateQr } = await import("@/lib/qrcode");

    const qr = await generateQr(ticketId);

    if (!qr?.buffer) {
      throw new Error("QR generator did not return a buffer");
    }

    console.log(
      `[WHATSAPP] QR generated for ticket ${ticketId}`
    );

    /*
     * 2. Upload QR to APIMIS
     */
    const mediaId = await uploadWhatsappMedia(
      qr.buffer,
      `${ticketId}.png`,
      authHeaders
    );

    console.log(
      `[WHATSAPP] APIMIS media ID: ${mediaId}`
    );

    /*
     * 3. Send WhatsApp template
     *
     * IMPORTANT:
     * Your WhatsApp template must have an IMAGE header.
     */
    const payload = {
      message: {
        type: "template",

        template: {
          name: templateName,

          language: {
            code: "en",
          },

          components: [
            {
              type: "header",

              parameters: [
                {
                  type: "image",

                  image: {
                    id: mediaId,
                  },
                },
              ],
            },

            /*
             * ONLY keep this component if your template
             * has body variables such as:
             *
             * Hello {{1}}, your ticket is {{2}}
             */
            {
              type: "body",

              parameters: [
                {
                  type: "text",
                  text: name,
                },
                {
                  type: "text",
                  text: ticketId,
                },
              ],
            },
          ],
        },
      },

      to: whatsappNumber,
    };

    console.log(
      "[WHATSAPP] Sending payload:",
      JSON.stringify(payload, null, 2)
    );

    /*
     * 4. Send through APIMIS
     */
    const response = await fetch(
      "https://wa.apimis.in/api/v1/whatsapp/meta/sendMessage",
      {
        method: "POST",

        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      }
    );

    const raw = await response.text();

    console.log(
      "[APIMIS SEND STATUS]",
      response.status
    );

    console.log(
      "[APIMIS SEND RESPONSE]",
      raw
    );

    if (!response.ok) {
      throw new Error(
        `WhatsApp send failed (${response.status}): ${raw}`
      );
    }

    let data = {};

    try {
      data = JSON.parse(raw);
    } catch {
      console.warn(
        "[WHATSAPP] APIMIS returned non-JSON response"
      );
    }

    console.log(
      `[WHATSAPP] Ticket ${ticketId} sent successfully`
    );

    return {
      sent: true,
      phone: whatsappNumber,
      ticketId,
      mediaId,
      response: data,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `[WHATSAPP] Failed for ticket ${ticketId}:`,
      message
    );

    return {
      sent: false,
      ticketId,
      error: message,
    };
  }
}