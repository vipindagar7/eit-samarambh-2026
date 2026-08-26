"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";
import Modal from "./Modal";
import RegistrationForm from "./RegistrationForm";

gsap.registerPlugin(ScrollTrigger);

export default function LuckyTicket() {
  const ref = useRef(null);
  const cardRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top 65%",
          toggleActions: "restart none restart reverse",
        },
      });

      tl.fromTo(
        cardRef.current,
        { rotateY: 180, opacity: 0, scale: 0.7 },
        { rotateY: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
      )
        .fromTo(
          ".ticket-burst span",
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            stagger: 0.03,
            ease: "back.out(3)",
          },
          "-=0.4"
        )
        .fromTo(
          ".ticket-text > *",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out" },
          "-=0.5"
        );

      gsap.to(".ticket-burst span", {
        y: -14,
        duration: 1.6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: { each: 0.15, from: "random" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const scrollTo = (selector) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="lucky-ticket" ref={ref} className="section" style={{ display: "flex", justifyContent: "center" }}>
      <div
        ref={cardRef}
        style={{
          position: "relative",
          maxWidth: 560,
          width: "100%",
          background:
            "linear-gradient(160deg, var(--accent-3), var(--bg-alt) 55%, var(--accent-1))",
          borderRadius: 28,
          padding: "56px 40px",
          textAlign: "center",
          overflow: "hidden",
          transformPerspective: 1000,
        }}
      >
        <div
          className="ticket-burst"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                width: 8,
                height: 8,
                borderRadius: i % 2 === 0 ? "50%" : 2,
                background: i % 3 === 0 ? "var(--accent-2)" : "var(--text)",
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        <div className="ticket-text" style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontSize: 13,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text)",
              opacity: 0.85,
              marginBottom: 14,
            }}
          >
            Surprise
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            You've got a free entry ticket
          </p>
          <p
            style={{
              color: "var(--text)",
              opacity: 0.85,
              fontSize: 15,
              marginBottom: 32,
              maxWidth: 420,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Just for scrolling this far — register now and we'll have it waiting
            for you at {config.fest.venue} on {config.fest.date}.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setModalOpen(true)}
              className="btn"
              style={{ background: "var(--bg)", color: "var(--text)" }}
            >
              Claim &amp; register →
            </button>
            <button
              onClick={() => scrollTo("body")}
              className="btn btn-outline"
              style={{ borderColor: "rgba(255,255,255,0.5)" }}
            >
              Back to home
            </button>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <RegistrationForm />
      </Modal>
    </section>
  );
}