"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";

gsap.registerPlugin(ScrollTrigger);

export default function ContactUs() {
  const ref = useRef(null);

  useEffect(() => {
    if (!config.contact?.enabled) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
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
  }, []);

  if (!config.contact?.enabled) return null;

  return (
    <section id="contact" ref={ref} className="section">
      <p className="eyebrow" style={{ marginBottom: 12 }}>Get in touch</p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          marginBottom: 32,
        }}
      >
        Contact us
      </h2>

      <div
        className="contact-card"
        style={{
          background: "var(--bg-alt)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "32px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 24,
        }}
      >
        <div>
          <p style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent-1)", marginBottom: 8 }}>
            Email
          </p>
          <a href={`mailto:${config.contact.email}`} style={{ fontSize: 16 }}>
            {config.contact.email}
          </a>
        </div>
        <div>
          <p style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent-1)", marginBottom: 8 }}>
            Phone
          </p>
          <a href={`tel:${config.contact.phone}`} style={{ fontSize: 16 }}>
            {config.contact.phone}
          </a>
        </div>
        <div>
          <p style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent-1)", marginBottom: 8 }}>
            Address
          </p>
          <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.5 }}>{config.contact.address ? <a target="_blank" href="https://maps.app.goo.gl/PtNgjTNXzdMCarTF7">{config.contact.address}</a> : config.contact.address}</p>
        </div>
      </div>
    </section>
  );
}
