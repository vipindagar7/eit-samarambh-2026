"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const BARS = 22;

export default function HeroVisual() {
  const vinylRef = useRef(null);
  const barsRef = useRef(null);
  const orbsRef = useRef(null);

  useEffect(() => {
    gsap.to(vinylRef.current, {
      rotate: 360,
      duration: 14,
      repeat: -1,
      ease: "linear",
    });

    const bars = barsRef.current.querySelectorAll(".wave-bar");
    bars.forEach((bar, i) => {
      gsap.to(bar, {
        scaleY: 0.25 + Math.random() * 0.9,
        duration: 0.4 + Math.random() * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.04,
      });
    });

    const orbs = orbsRef.current.querySelectorAll(".orb");
    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        y: -30 - i * 8,
        x: (i % 2 === 0 ? 1 : -1) * (12 + i * 4),
        duration: 4 + i,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 420,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* light rays */}
      <svg
        viewBox="0 0 600 600"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          const x2 = (300 + Math.cos((angle * Math.PI) / 180) * 320).toFixed(2);
          const y2 = (300 + Math.sin((angle * Math.PI) / 180) * 320).toFixed(2);
          return (
            <line
              key={i}
              x1="300"
              y1="300"
              x2={x2}
              y2={y2}
              stroke="var(--accent-2)"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      {/* floating glow orbs */}
      <div ref={orbsRef} style={{ position: "absolute", inset: 0 }}>
        <div
          className="orb"
          style={{
            position: "absolute",
            top: "12%",
            left: "18%",
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "var(--accent-1)",
            filter: "blur(18px)",
            opacity: 0.55,
          }}
        />
        <div
          className="orb"
          style={{
            position: "absolute",
            bottom: "14%",
            right: "12%",
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "var(--accent-3)",
            filter: "blur(24px)",
            opacity: 0.5,
          }}
        />
        <div
          className="orb"
          style={{
            position: "absolute",
            top: "55%",
            right: "22%",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--accent-2)",
            filter: "blur(14px)",
            opacity: 0.6,
          }}
        />
      </div>

      {/* spinning vinyl record */}
      <div
        ref={vinylRef}
        style={{
          position: "relative",
          width: "min(46vw, 320px)",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          background:
            "repeating-radial-gradient(circle, #0d0716 0px, #0d0716 6px, #1c1030 7px, #1c1030 9px)",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "34%",
            height: "34%",
            borderRadius: "50%",
            background: "var(--accent-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "22%",
              height: "22%",
              borderRadius: "50%",
              background: "var(--bg)",
            }}
          />
        </div>
      </div>

      {/* waveform bars along the bottom */}
      <div
        ref={barsRef}
        style={{
          position: "absolute",
          bottom: "6%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "flex-end",
          gap: 5,
          height: 70,
          zIndex: 1,
        }}
      >
        {Array.from({ length: BARS }).map((_, i) => (
          <div
            key={i}
            className="wave-bar"
            style={{
              width: 5,
              height: 70,
              borderRadius: 3,
              background: i % 3 === 0 ? "var(--accent-2)" : "var(--accent-1)",
              transformOrigin: "bottom",
              transform: "scaleY(0.4)",
            }}
          />
        ))}
      </div>
    </div>
  );
}