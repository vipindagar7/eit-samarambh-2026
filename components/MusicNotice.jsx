"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

export default function MusicNotice() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setShow(true), 1200);
    const hide = setTimeout(() => setShow(false), 8000);
    return () => {
      clearTimeout(t);
      clearTimeout(hide);
    };
  }, [dismissed]);

  useEffect(() => {
    gsap.to(".music-notice", {
      opacity: show ? 1 : 0,
      y: show ? 0 : 10,
      duration: 0.4,
      ease: "power2.out",
      pointerEvents: show ? "auto" : "none",
    });
  }, [show]);

  const close = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <div
      className="music-notice"
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        opacity: 0,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--bg-alt)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 100,
        padding: "10px 16px",
        fontSize: 13,
        color: "var(--text)",
        boxShadow: "0 15px 40px -15px rgba(0,0,0,0.6)",
      }}
    >
      <span>Playing a teaser clip as you scroll</span>
      <button
        onClick={close}
        aria-label="Dismiss"
        style={{
          fontSize: 13,
          color: "var(--text-muted)",
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
