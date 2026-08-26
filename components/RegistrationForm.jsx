"use client";

import { useState } from "react";
import config from "@/lib/config";
import Magnetic from "./Magnetic";

const fieldLabels = {
  name: "Full name",
  email: "Email address",
  phone: "Phone number",
  college: "College / branch",
};

// The actual form card — reused by the inline Registration section
// and by the popup modal opened from the surprise ticket.
export default function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [results, setResults] = useState(null);

  const handleChange = (field, val) => {
    setValues((v) => ({ ...v, [field]: val }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missing = config.registration.fields.filter((f) => !values[f]?.trim());
    if (missing.length) {
      setError(`Please fill in ${fieldLabels[missing[0]].toLowerCase()}.`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(config.registration.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setTicketId(data.ticketId || null);
      setQrDataUrl(data.qrDataUrl || null);
      setResults(data);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Couldn't submit right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${config.fest.name.replace(/\s+/g, "-").toLowerCase()}-ticket-${ticketId || ""}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!config.registration.enabled) return null;

  return (
    <div
      className="reg-card"
      style={{
        maxWidth: 560,
        width: "100%",
        margin: "0 auto",
        background: "var(--bg-alt)",
        borderRadius: 28,
        padding: "48px 40px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {submitted ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              marginBottom: 12,
              color: "var(--accent-2)",
            }}
          >
            You're in.
          </p>
          <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
            See you at {config.fest.venue} on {config.fest.date}.
            {results?.email?.sent && " A confirmation has also been emailed to you."}
          </p>

          {ticketId && (
            <p
              style={{
                fontSize: 14,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent-2)",
                marginBottom: qrDataUrl ? 20 : 0,
              }}
            >
              Ticket ID: <strong style={{ color: "var(--text)" }}>{ticketId}</strong>
            </p>
          )}

          {qrDataUrl && (
            <div style={{ display: "inline-block" }}>
              <img
                src={qrDataUrl}
                alt="Entry QR code"
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <div style={{ marginTop: 16 }}>
                <Magnetic as="button" onClick={downloadQr} className="btn btn-outline">
                  Download QR
                </Magnetic>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Reserve your spot</p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              marginBottom: 32,
            }}
          >
            Get your pass
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {config.registration.fields.map((field) => (
              <input
                key={field}
                type={field === "email" ? "email" : "text"}
                placeholder={fieldLabels[field] || field}
                value={values[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 12,
                  padding: "16px 18px",
                  color: "var(--text)",
                  fontSize: 15,
                  fontFamily: "var(--font-body)",
                }}
              />
            ))}

            {error && <p style={{ color: "var(--accent-1)", fontSize: 13 }}>{error}</p>}

            <Magnetic
              as="button"
              type="submit"
              className="btn"
              style={{
                marginTop: 8,
                justifyContent: "center",
                width: "100%",
                opacity: submitting ? 0.7 : 1,
                pointerEvents: submitting ? "none" : "auto",
              }}
            >
              {submitting ? "Submitting…" : "Confirm registration"}
            </Magnetic>
          </form>
        </>
      )}
    </div>
  );
}