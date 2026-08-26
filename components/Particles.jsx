"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const COUNT = 22;

export default function Particles() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const dots = wrapRef.current.querySelectorAll(".particle");
    dots.forEach((dot) => {
      gsap.set(dot, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        opacity: 0.2 + Math.random() * 0.4,
        scale: 0.4 + Math.random() * 0.8,
      });
      gsap.to(dot, {
        y: `-=${80 + Math.random() * 120}`,
        x: `+=${(Math.random() - 0.5) * 100}`,
        duration: 8 + Math.random() * 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 4,
      });
    });
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: COUNT }).map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            position: "absolute",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: i % 2 === 0 ? "var(--accent-2)" : "var(--accent-1)",
          }}
        />
      ))}
    </div>
  );
}
