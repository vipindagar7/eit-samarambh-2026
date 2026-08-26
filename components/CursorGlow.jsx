"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;

    const glow = glowRef.current;
    const xTo = gsap.quickTo(glow, "x", { duration: 0.8, ease: "power3.out" });
    const yTo = gsap.quickTo(glow, "y", { duration: 0.8, ease: "power3.out" });

    const onMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={glowRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 420,
        height: 420,
        marginLeft: -210,
        marginTop: -210,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255,61,104,0.14) 0%, rgba(124,58,237,0.08) 45%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 1,
        mixBlendMode: "screen",
      }}
    />
  );
}
