"use client";

import { useEffect, useState } from "react";
import config from "@/lib/config";
import Modal from "./Modal";

const SESSION_KEY = "transport-popup-seen";

export default function TransportPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!config.transport?.enabled) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // small delay so it doesn't fight with the entry-gate/intro animation
    const t = setTimeout(() => setOpen(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  if (!config.transport?.enabled) return null;

  return (
    <Modal open={open} onClose={close}>
      <div
        style={{
          background: "linear-gradient(165deg, var(--bg-alt), var(--bg))",
          border: "1.5px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "32px 28px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.6rem",
            color: "var(--accent-2)",
            letterSpacing: 0.5,
            marginBottom: 6,
          }}
        >
          🚌 Transport Confirmation Required
        </p>

        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 18,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Replace /images/transport-bus.jpg with the real shuttle/bus image */}
          <img
            src="/images/transport-bus.jpg"
            alt="Echelon shuttle service"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
          Echelon's free shuttle service runs from <strong style={{ color: "var(--text)" }}>{config.transport.startsAt}</strong> from
          four pick-up points. Select yours in the form below so we can plan the buses.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {config.transport.pickupPoints.map((p, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                📍 {i + 1}. {p.name}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
                👤 {p.coordinator}: <a href={`tel:${p.phone}`} style={{ color: "var(--accent-2)" }}>{p.phone}</a>
              </p>
            </div>
          ))}
        </div>

        <a
          href={config.transport.formUrl}
          target="_blank"
          rel="noreferrer"
          onClick={close}
          style={{
            display: "block",
            textAlign: "center",
            background: "linear-gradient(90deg, var(--accent-1), var(--accent-3))",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: "14px 20px",
            borderRadius: 12,
            marginBottom: 10,
          }}
        >
          Select my pick-up point →
        </a>

        <button
          onClick={close}
          style={{
            display: "block",
            width: "100%",
            textAlign: "center",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: 13,
            padding: "8px",
          }}
        >
          I'll do this later
        </button>
      </div>
    </Modal>
  );
}