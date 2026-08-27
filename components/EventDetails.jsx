"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";

gsap.registerPlugin(ScrollTrigger);

// each card gets a distinct "surprise" entrance animation
const items = [
  { label: "Date", value: config.fest.date, anim: "flip" },
  { label: "Time", value: config.fest.time, anim: "dropBounce" },
  { label: "Venue", value: config.fest.venue, anim: "slideSpin" },
  { label: "Institute", value: config.fest.collegeShort, anim: "popZoom" },
];

const animFrom = {
  flip: { rotateX: 110, opacity: 0, transformOrigin: "top" },
  dropBounce: { y: -120, opacity: 0 },
  slideSpin: { x: -100, opacity: 0, rotate: -25 },
  popZoom: { scale: 0.3, opacity: 0 },
};

const animEase = {
  flip: "power2.out",
  dropBounce: "bounce.out",
  slideSpin: "back.out(1.8)",
  popZoom: "elastic.out(1, 0.6)",
};

export default function EventDetails() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".detail-card").forEach((card, i) => {
        const anim = card.dataset.anim;
        gsap.set(card, { transformPerspective: 700 });
        gsap.fromTo(
          card,
          animFrom[anim],
          {
            y: 0,
            x: 0,
            scale: 1,
            rotate: 0,
            rotateX: 0,
            opacity: 1,
            duration: 0.9,
            delay: i * 0.1,
            ease: animEase[anim],
            scrollTrigger: {
              trigger: ref.current,
              start: "top 78%",
              toggleActions: "restart none restart reverse",
            },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="section" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            className="detail-card"
            data-anim={item.anim}
            style={{
              background: "var(--bg-alt)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: "28px 24px",
            }}
          >
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--accent-1)",
                marginBottom: 10,
              }}
            >
              {item.label}
            </p>
            <p style={{ fontSize: "1.3rem", fontWeight: 600 }}>{item.label === 'Institute' ? <a target="_blank" href="https://maps.app.goo.gl/PtNgjTNXzdMCarTF7">{item.value}</a> : item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
