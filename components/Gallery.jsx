"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const panels = [
  { label: "Last year's crowd", color: "var(--accent-3)", file: "gallery-1.jpg", from: "left" },
  { label: "The stage setup", color: "var(--accent-1)", file: "gallery-2.jpg", from: "top" },
  { label: "Fest vibes", color: "var(--accent-2)", file: "gallery-3.jpg", from: "right" },
  { label: "Backstage", color: "var(--bg-alt)", file: "gallery-4.jpg", from: "bottom" },
].map((p) => ({ ...p, url: `/images/${p.file}` }));

const fromOffsets = {
  left: { x: -160, y: -60 },
  top: { x: 0, y: -220 },
  right: { x: 160, y: -60 },
  bottom: { x: 0, y: 160 },
};

export default function Gallery() {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const [loaded, setLoaded] = useState({});

  useEffect(() => {
    panels.forEach((p) => {
      if (!p.url) return;
      const img = new Image();
      img.onload = () => setLoaded((l) => ({ ...l, [p.file]: true }));
      img.src = p.url;
    });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const scrollAmount = track.scrollWidth - window.innerWidth + 128;

      const pinTl = gsap.to(track, {
        x: -scrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: () => `+=${scrollAmount}`,
          scrub: 1,
          pin: true,
        },
      });

      // stair-step fall: each panel drops in from a different direction,
      // with increasing delay + increasing fall distance like a staircase
      gsap.utils.toArray(".gallery-panel").forEach((panel, i) => {
        const card = panel.querySelector(".panel-card");
        const offset = fromOffsets[panel.dataset.from];

        gsap.fromTo(
          panel,
          {
            x: offset.x,
            y: offset.y - i * 30,
            opacity: 0,
            rotate: (i % 2 === 0 ? -1 : 1) * (6 + i * 2),
          },
          {
            x: 0,
            y: 0,
            opacity: 1,
            rotate: 0,
            duration: 0.9,
            delay: i * 0.22,
            ease: "bounce.out",
            scrollTrigger: {
              trigger: wrapRef.current,
              start: "top center",
              toggleActions: "restart none restart reverse",
            },
          }
        );

        panel.addEventListener("mouseenter", () =>
          gsap.to(card, { scale: 1.05, duration: 0.4, ease: "power2.out" })
        );
        panel.addEventListener("mouseleave", () =>
          gsap.to(card, { scale: 1, duration: 0.5, ease: "power3.out" })
        );
      });

      // the last panel fades away once the horizontal pin-scroll is nearly done
      const lastPanel = trackRef.current.querySelector(".gallery-panel:last-child");
      if (lastPanel) {
        gsap.to(lastPanel, {
          opacity: 0,
          scale: 0.85,
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top top",
            end: () => `+=${scrollAmount}`,
            scrub: 1,
            containerAnimation: pinTl.scrollTrigger ? undefined : undefined,
          },
        });
      }
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrapRef} style={{ overflow: "hidden" }}>
      <div style={{ padding: "0 8vw", paddingTop: 100 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Sneak peek</p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            marginBottom: 60,
          }}
        >
          The hype so far
        </h2>
      </div>
      <div
        ref={trackRef}
        style={{ display: "flex", gap: "48px", padding: "40px 8vw 160px", width: "max-content" }}
      >
        {panels.map((p, i) => (
          <div
            key={i}
            className="gallery-panel"
            data-from={p.from}
            style={{
              position: "relative",
              width: "min(60vw, 480px)",
            }}
          >
            <div
              className="panel-card"
              style={{
                aspectRatio: "4 / 3",
                borderRadius: 24,
                background: p.color,
                display: "flex",
                alignItems: "flex-end",
                padding: 28,
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 30px 50px -25px rgba(0,0,0,0.55)",
              }}
            >
              {loaded[p.file] && (
                <img
                  src={p.url}
                  alt={p.label}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  textShadow: loaded[p.file] ? "0 2px 12px rgba(0,0,0,0.6)" : "none",
                }}
              >
                {p.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
