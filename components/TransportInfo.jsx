"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";

gsap.registerPlugin(ScrollTrigger);

export default function TransportInfo() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".transport-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 80%",
              toggleActions: "restart none restart reverse",
            },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  if (!config.transport?.enabled) return null;

  return (
    <section ref={ref} className="section" style={{ paddingTop: 60, paddingBottom: 60 }}>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
          color: "var(--accent-2)",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        🚌 Free Shuttle Service
      </p>
      <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: 32, fontSize: 15 }}>
        Available from <strong style={{ color: "var(--text)" }}>{config.transport.startsAt}</strong> from four pick-up points
      </p>

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto 32px",
          aspectRatio: "16 / 9",
          borderRadius: 18,
          overflow: "hidden",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <img
          src="/images/transport-bus.jpg"
          alt="Echelon shuttle service"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          maxWidth: 900,
          margin: "0 auto 28px",
        }}
      >
        {config.transport.pickupPoints.map((p, i) => (
          <div
            key={i}
            className="transport-card"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "18px 20px",
            }}
          >
            <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 6 }}>
              📍 {p.name}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>👤 {p.coordinator}</p>
            <a href={`tel:${p.phone}`} style={{ fontSize: 13, color: "var(--accent-2)", fontWeight: 600 }}>
              {p.phone}
            </a>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <a
          href={config.transport.formUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            background: "linear-gradient(90deg, var(--accent-1), var(--accent-3))",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: "14px 32px",
            borderRadius: 14,
          }}
        >
          Select my pick-up point →
        </a>
      </div>
    </section>
  );
}