"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";

gsap.registerPlugin(ScrollTrigger);

export default function Schedule() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".sched-row").forEach((row, i) => {
        const item = row.querySelector(".sched-item");
        const dot = row.querySelector(".sched-dot");
        const fromLeft = i % 2 === 0;

        gsap.fromTo(
          item,
          { x: fromLeft ? -80 : 80, opacity: 0, rotate: fromLeft ? -4 : 4 },
          {
            x: 0,
            opacity: 1,
            rotate: 0,
            duration: 0.8,
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: item,
              start: "top 82%",
              toggleActions: "restart none restart reverse",
            },
          }
        );

        gsap.fromTo(
          dot,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.5,
            ease: "back.out(3)",
            scrollTrigger: {
              trigger: item,
              start: "top 78%",
              toggleActions: "restart none restart reverse",
            },
          }
        );
      });

      gsap.fromTo(
        ".sched-line",
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 70%",
            end: "bottom 70%",
            scrub: 1,
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="section">
      <p className="eyebrow" style={{ marginBottom: 12 }}>Lineup</p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          marginBottom: 80,
        }}
      >
        How the night unfolds
      </h2>

      <div style={{ position: "relative" }}>
        <div
          className="sched-line"
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            marginLeft: -1,
            background: "var(--accent-1)",
          }}
        />
        {config.schedule.map((item, i) => {
          const fromLeft = i % 2 === 0;
          return (
            <div
              key={i}
              className="sched-row"
              style={{
                position: "relative",
                display: "flex",
                justifyContent: fromLeft ? "flex-start" : "flex-end",
                marginBottom: 70,
              }}
            >
              <span
                className="sched-dot"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 4,
                  marginLeft: -8,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "var(--accent-2)",
                  border: "3px solid var(--bg)",
                  zIndex: 2,
                }}
              />
              <div
                className="sched-item"
                style={{
                  width: "calc(50% - 50px)",
                  textAlign: fromLeft ? "right" : "left",
                  paddingRight: fromLeft ? 40 : 0,
                  paddingLeft: fromLeft ? 0 : 40,
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--accent-2)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {item.time}
                </p>
                <p style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 4 }}>{item.title}</p>
                <p style={{ color: "var(--text-muted)" }}>{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .sched-line { left: 20px !important; margin-left: 0 !important; }
          .sched-dot { left: 20px !important; margin-left: -8px !important; }
          .sched-row { justify-content: flex-start !important; }
          .sched-item {
            width: calc(100% - 50px) !important;
            text-align: left !important;
            padding-left: 40px !important;
            padding-right: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}