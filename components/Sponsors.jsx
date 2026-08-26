"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";

gsap.registerPlugin(ScrollTrigger);

// Optional section — set config.sponsors.enabled to false to hide entirely.
export default function Sponsors() {
  const ref = useRef(null);

  useEffect(() => {
    if (!config.sponsors?.enabled) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".sponsor-chip").forEach((chip, i) => {
        gsap.fromTo(
          chip,
          { opacity: 0, y: i % 2 === 0 ? 24 : -24, scale: 0.8, rotate: i % 2 === 0 ? -6 : 6 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.55,
            delay: i * 0.07,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 80%",
              toggleActions: "restart none restart reverse",
            },
          }
        );

        chip.addEventListener("mouseenter", () =>
          gsap.to(chip, { scale: 1.08, y: -4, duration: 0.25, ease: "power2.out" })
        );
        chip.addEventListener("mouseleave", () =>
          gsap.to(chip, { scale: 1, y: 0, duration: 0.35, ease: "power3.out" })
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  if (!config.sponsors?.enabled || config.sponsors.list.length === 0) return null;

  return (
    <section ref={ref} className="section" style={{ paddingTop: 40, paddingBottom: 40, textAlign: "center" }}>
      <p className="eyebrow" style={{ marginBottom: 24 }}>Past sponsors</p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {config.sponsors.list.map((s, i) => (
          <span
            key={i}
            className="sponsor-chip"
            style={{
              display: "inline-block",
              background: "var(--bg-alt)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 100,
              padding: "10px 22px",
              fontSize: 14,
              color: "var(--text-muted)",
              cursor: "default",
            }}
          >
            {s.name}
          </span>
        ))}
      </div>
    </section>
  );
}
