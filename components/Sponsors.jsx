"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";

gsap.registerPlugin(ScrollTrigger);

// Optional section — set config.sponsors.enabled to false to hide entirely.
export default function Sponsors() {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState({});

  useEffect(() => {
    if (!config.sponsors?.enabled) return;
    config.sponsors.list.forEach((s) => {
      if (!s.logo) return;
      const img = new Image();
      img.onload = () => setLoaded((l) => ({ ...l, [s.logo]: true }));
      img.src = `/images/sponsors/${s.logo}`;
    });
  }, []);

  useEffect(() => {
    if (!config.sponsors?.enabled) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".sponsor-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: i % 2 === 0 ? 24 : -24, scale: 0.8, rotate: i % 2 === 0 ? -6 : 6 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.55,
            delay: (i % 10) * 0.06,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 80%",
              toggleActions: "restart none restart reverse",
            },
          }
        );

        card.addEventListener("mouseenter", () =>
          gsap.to(card, { scale: 1.08, y: -4, duration: 0.25, ease: "power2.out" })
        );
        card.addEventListener("mouseleave", () =>
          gsap.to(card, { scale: 1, y: 0, duration: 0.35, ease: "power3.out" })
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  if (!config.sponsors?.enabled || config.sponsors.list.length === 0) return null;

  return (
    <section ref={ref} className="section" style={{ paddingTop: 60, paddingBottom: 60, textAlign: "center" }}>
      <p className="eyebrow" style={{ marginBottom: 12 }}>Backing the night</p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          marginBottom: 40,
        }}
      >
        Our past sponsors
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 20,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {config.sponsors.list.map((s, i) => (
          <div
            key={i}
            className="sponsor-card"
            style={{
              background: "var(--bg-alt)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "20px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 90,
              cursor: "default",
            }}
          >
            {s.logo && loaded[s.logo] ? (
              <img
                src={`/images/sponsors/${s.logo}`}
                alt={s.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: 56,
                  objectFit: "contain",
                }}
              />
            ) : (
              <span style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center" }}>
                {s.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}