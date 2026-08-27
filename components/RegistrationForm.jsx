"use client";

import { useEffect, useRef, useState } from "react";
import config from "@/lib/config";
import Magnetic from "./Magnetic";

const studentTypeOptions = ["College Student", "School Student"];

function getFieldLabel(field, studentType) {
  if (field === "college") {
    return studentType === "School Student" ? "School name" : "Institute name";
  }
  if (field === "passingYear") {
    return studentType === "School Student" ? "Class" : "12th passing year";
  }
  const labels = {
    studentType: "I am a...",
    name: "Full name",
    email: "Email address",
    phone: "Phone number",
  };
  return labels[field] || field;
}

const fieldTypes = {
  email: "email",
  phone: "tel",
};

// Per-field format validation, run only after the required-field check passes.
function validateField(field, value, studentType) {
  const v = value.trim();
  switch (field) {
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        return "Please enter a valid email address.";
      }
      break;
    case "phone":
      if (!/^\d{10}$/.test(v)) {
        return "Please enter a valid 10-digit phone number.";
      }
      break;
    case "passingYear": {
      if (studentType === "School Student") {
        const cls = Number(v);
        if (!Number.isInteger(cls) || cls < 1 || cls > 12) {
          return "Please enter a valid class (1-12).";
        }
      } else {
        const year = Number(v);
        const now = new Date().getFullYear();
        if (!Number.isInteger(year) || year < 1990 || year > now + 6) {
          return "Please enter a valid 12th passing year.";
        }
      }
      break;
    }
    default:
      break;
  }
  return null;
}

const MAX_ATTEMPTS_PER_CHANNEL = 2;

// The actual form card — reused by the inline Registration section
// and by the popup modal opened from the surprise ticket.
export default function RegistrationForm() {
  // "form" -> "otp" -> "done" | "gave-up"
  const [stage, setStage] = useState("form");
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({ studentType: "" });
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [results, setResults] = useState(null);

  // OTP step state
  const [otpToken, setOtpToken] = useState(null);
  const [otpChannel, setOtpChannel] = useState("mobile"); // "mobile" | "email"
  const [otpValue, setOtpValue] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [attemptsLeft, setAttemptsLeft] = useState({ mobile: MAX_ATTEMPTS_PER_CHANNEL, email: MAX_ATTEMPTS_PER_CHANNEL });
  const timerRef = useRef(null);

  const studentType = values.studentType || "";

  const handleChange = (field, val) => {
    setValues((v) => ({ ...v, [field]: val }));
    if (error) setError("");
  };

  const startCountdown = () => {
    clearInterval(timerRef.current);
    setSecondsLeft(30);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missing = config.registration.fields.filter((f) => !values[f]?.trim());
    if (missing.length) {
      setError(`Please fill in ${getFieldLabel(missing[0], studentType).toLowerCase()}.`);
      return;
    }

    for (const field of config.registration.fields) {
      const err = validateField(field, values[field], studentType);
      if (err) {
        setError(err);
        return;
      }
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/otp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setOtpToken(data.token);
      setOtpChannel("mobile");
      setAttemptsLeft({ mobile: MAX_ATTEMPTS_PER_CHANNEL - 1, email: MAX_ATTEMPTS_PER_CHANNEL });
      setStage("otp");
      startCountdown();

      if (!data.mobileSendOk) {
        setError("Couldn't send the code by SMS — you can switch to email below.");
      }
    } catch (err) {
      setError(err.message || "Couldn't submit right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otpValue.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otpToken, otp: otpValue.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Incorrect code. Please try again.");
      }

      setTicketId(data.ticketId || null);
      setQrDataUrl(data.qrDataUrl || null);
      setResults(data);
      setStage("done");
      clearInterval(timerRef.current);
    } catch (err) {
      setError(err.message || "Couldn't verify right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const switchChannelOrResend = async (channel) => {
    setError("");
    setOtpValue("");

    const left = attemptsLeft[channel];
    if (left <= 0) {
      setError(`No more ${channel} attempts left.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otpToken, channel }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Couldn't resend the code.");
      }

      setOtpChannel(channel);
      setAttemptsLeft((a) => ({ ...a, [channel]: data.attemptsLeft }));
      startCountdown();

      if (!data.sendOk) {
        setError(`Couldn't send the code via ${channel}. Please try the other option.`);
      }
    } catch (err) {
      setError(err.message || "Couldn't resend right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const proceedWithoutOtp = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/otp/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otpToken }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Couldn't complete registration. Please try again.");
      }

      setTicketId(data.ticketId || null);
      setQrDataUrl(data.qrDataUrl || null);
      setResults(data);
      setStage("done");
      clearInterval(timerRef.current);
    } catch (err) {
      setError(err.message || "Couldn't complete registration right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const noAttemptsLeftAnywhere = attemptsLeft.mobile <= 0 && attemptsLeft.email <= 0;

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

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 12,
    padding: "16px 18px",
    color: "var(--text)",
    fontSize: 15,
    fontFamily: "var(--font-body)",
  };

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
      {stage === "done" && (
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
                style={{ width: 200, height: 200, borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <div style={{ marginTop: 16 }}>
                <Magnetic as="button" onClick={downloadQr} className="btn btn-outline">
                  Download QR
                </Magnetic>
              </div>
            </div>
          )}
        </div>
      )}

      {stage === "form" && (
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
            {config.registration.fields.map((field) => {
              if (field === "studentType") {
                return (
                  <div key={field} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label
                      htmlFor="studentType"
                      style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.02em" }}
                    >
                      School or College?
                    </label>
                    <select
                      id="studentType"
                      required
                      value={values.studentType || ""}
                      onChange={(e) => handleChange("studentType", e.target.value)}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="" disabled style={{ color: "#000" }}>
                        Select one
                      </option>
                      {studentTypeOptions.map((opt) => (
                        <option key={opt} value={opt} style={{ color: "#000" }}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (!studentType) return null;

              return (
                <input
                  key={field}
                  type={fieldTypes[field] || "text"}
                  required
                  placeholder={getFieldLabel(field, studentType)}
                  value={values[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  style={inputStyle}
                />
              );
            })}

            {!studentType && (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Choose one above to continue.
              </p>
            )}

            {error && <p style={{ color: "var(--accent-1)", fontSize: 13 }}>{error}</p>}

            {studentType && (
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
              {submitting ? "Sending code…" : "Send verification code"}
            </Magnetic>
            )}
          </form>
        </>
      )}

      {stage === "otp" && (
        <>
          <p className="eyebrow" style={{ marginBottom: 10 }}>Almost there</p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              marginBottom: 12,
            }}
          >
            Enter the code
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28 }}>
            Sent via {otpChannel === "mobile" ? "SMS to your phone" : "email"}.
          </p>

          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              placeholder="6-digit code"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
              style={{ ...inputStyle, textAlign: "center", letterSpacing: "0.5em", fontSize: 20 }}
            />

            {error && <p style={{ color: "var(--accent-1)", fontSize: 13 }}>{error}</p>}

            <Magnetic
              as="button"
              type="submit"
              className="btn"
              style={{
                justifyContent: "center",
                width: "100%",
                opacity: submitting || otpValue.length < 6 ? 0.6 : 1,
                pointerEvents: submitting || otpValue.length < 6 ? "none" : "auto",
              }}
            >
              {submitting ? "Verifying…" : "Verify & confirm"}
            </Magnetic>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            {secondsLeft > 0 ? (
              <p>Didn't get it? You can try another option in {secondsLeft}s.</p>
            ) : noAttemptsLeftAnywhere ? (
              <Magnetic
                as="button"
                onClick={proceedWithoutOtp}
                className="btn btn-outline"
                style={{ marginTop: 8, opacity: submitting ? 0.7 : 1, pointerEvents: submitting ? "none" : "auto" }}
              >
                {submitting ? "Registering…" : "Continue without verification"}
              </Magnetic>
            ) : (
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
                {attemptsLeft.mobile > 0 && (
                  <button
                    onClick={() => switchChannelOrResend("mobile")}
                    className="btn btn-outline"
                    style={{ fontSize: 13, padding: "10px 18px" }}
                  >
                    Resend via SMS
                  </button>
                )}
                {attemptsLeft.email > 0 && (
                  <button
                    onClick={() => switchChannelOrResend("email")}
                    className="btn btn-outline"
                    style={{ fontSize: 13, padding: "10px 18px" }}
                  >
                    Send via email instead
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}