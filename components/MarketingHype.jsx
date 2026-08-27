"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";

gsap.registerPlugin(ScrollTrigger);

export default function MarketingHype() {
  const ref = useRef(null);
  const { checklist, pitch } = config.fest.marketing || {};

  useEffect(() => {
    if (!checklist?.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hype-check",
        { opacity: 0, y: 24, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.6)",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 75%",
            toggleActions: "restart none restart reverse",
          },
        }
      );

      gsap.fromTo(
        ".hype-pitch",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 75%",
            toggleActions: "restart none restart reverse",
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [checklist]);

  if (!checklist?.length && !pitch) return null;

  return (
    <section ref={ref} className="section" style={{ textAlign: "center" }}>
      {checklist?.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {checklist.map((item, i) => (
            <div
              key={i}
              className="hype-check"
              style={{
                background: "var(--bg-alt)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 100,
                padding: "14px 26px",
                fontSize: "clamp(1rem, 2.2vw, 1.3rem)",
                fontWeight: 600,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}

      {pitch && (
        <p
          className="hype-pitch"
          style={{
            maxWidth: 680,
            margin: "0 auto",
            fontSize: "clamp(1.05rem, 2.4vw, 1.4rem)",
            lineHeight: 1.6,
            color: "var(--text-muted)",
          }}
        >
          {pitch}
        </p>
      )}
    </section>
  );
}
