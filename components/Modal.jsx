"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Modal({ open, onClose, children }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }
    );

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(10,5,20,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflowY: "auto",
      }}
    >
      <div ref={panelRef} style={{ position: "relative", width: "100%", maxWidth: 560 }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: -44,
            right: 0,
            fontSize: 24,
            color: "var(--text)",
            lineHeight: 1,
            padding: 8,
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}