"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import config from "@/lib/config";

// Browsers only allow audio to autoplay after a genuine user gesture
// (click/tap/keypress) — scrolling alone never counts, in any browser.
// This gate captures that one required interaction up front, in a way
// that feels like a normal "enter the site" moment rather than a
// permission prompt. Once dismissed, autoplay-on-scroll works reliably
// for the rest of the session.
const hasSamarambh = "/images/samarambh.png";

export default function EntryGate() {
  const [hasLogoSamarambh, setHasLogoSamarambh] = useState(false);

  useEffect(() => {
    if (!hasSamarambh) return;
    const img = new Image();
    img.onload = () => setHasLogoSamarambh(true);
    img.onerror = () => setHasLogoSamarambh(false);
    img.src = hasSamarambh;
  }, []);
  const [dismissed, setDismissed] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const enter = () => {
    if (!overlayRef.current) return;
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        document.body.style.overflow = "";
        setDismissed(true);
      },
    });
  };

  if (dismissed) return null;

  return (
    <div
      ref={overlayRef}
      onClick={enter}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") enter();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        textAlign: "center",
        padding: 24,
      }}
    >
      <p
        style={{
          fontSize: 12,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--accent-2)",
          marginBottom: 16,
        }}
      >
        {config.fest.college}
      </p>
      {hasLogoSamarambh ? (
        <div>
          <img
            src={hasSamarambh}
            alt={config.fest.collegeShort}
            style={{
              width: 664,
              height: "auto",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
        </div>
      ) : (
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(6.5rem, 16vw, 12rem)",
            lineHeight: 1,
            color: "#FFBF00",
            marginBottom: 28,
          }}
        >
          समारंभ
        </h1>
      )
      }
      <h2
        style={{
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--accent-2)",
          marginBottom: 16,
        }}
      >
        2k26
      </h2>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 34px",
          borderRadius: 100,
          border: "1.5px solid var(--text-muted)",
          fontSize: 14,
          letterSpacing: "0.05em",
        }}
      >
        Tap to enter
      </div>
    </div>
  );
}
