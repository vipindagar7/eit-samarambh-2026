"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";

gsap.registerPlugin(ScrollTrigger);

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Coordinators() {
  const ref = useRef(null);
  const facultyEnabled = config.facultyCoordinators?.enabled && config.facultyCoordinators.list.length > 0;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".coord-card").forEach((card, i) => {
        const fromLeft = i % 2 === 0;
        gsap.fromTo(
          card,
          { y: 40, x: fromLeft ? -30 : 30, opacity: 0, scale: 0.9, rotate: fromLeft ? -3 : 3 },
          {
            y: 0,
            x: 0,
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.7,
            delay: i * 0.08,
            ease: "back.out(1.6)",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 75%",
              toggleActions: "restart none restart reverse",
            },
          }
        );

        card.addEventListener("mouseenter", () =>
          gsap.to(card, { y: -6, scale: 1.03, duration: 0.3, ease: "power2.out" })
        );
        card.addEventListener("mouseleave", () =>
          gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: "power3.out" })
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const renderCard = (c, i) => (
    <div
      key={i}
      className="coord-card"
      style={{
        background: "var(--bg-alt)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: "22px 20px",
        display: "flex",
        gap: 14,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "linear-gradient(145deg, var(--accent-1), var(--accent-3))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {initials(c.name)}
      </div>
      <div>
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{c.name}</p>
        <p style={{ fontSize: 13, color: "var(--accent-2)", marginBottom: 6 }}>{c.role}</p>
        {c.phone && (
          <a href={`tel:${c.phone}`} style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {c.phone}
          </a>
        )}
      </div>
    </div>
  );

  return (
    <section ref={ref} className="section">
      <p className="eyebrow" style={{ marginBottom: 12 }}>The team</p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          marginBottom: 40,
        }}
      >
        Student coordinators
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: facultyEnabled ? 60 : 0,
        }}
      >
        {config.studentCoordinators.map(renderCard)}
      </div>

      {facultyEnabled && (
        <>
          <p className="eyebrow" style={{ marginBottom: 12 }}>Guidance</p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              marginBottom: 32,
            }}
          >
            Faculty coordinators
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {config.facultyCoordinators.list.map(renderCard)}
          </div>
        </>
      )}
    </section>
  );
}
