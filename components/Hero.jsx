"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";
import Blobs from "./Blobs";
import HeroVisual from "./HeroVisual";

gsap.registerPlugin(ScrollTrigger);

function getTimeLeft() {
  const diff = new Date(config.fest.isoDate).getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / (1000 * 60)) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export default function Hero() {
  const titleRef = useRef(null);
  const blobRef = useRef(null);
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const previewRef = useRef(null);
  // Start with a deterministic value so server-rendered HTML matches the
  // client's first render exactly (Date.now() differs by the time it takes
  // to send the response, causing a 1-second-off hydration mismatch). The
  // real countdown kicks in immediately after mount.
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    setTime(getTimeLeft());
    const t = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const chars = titleRef.current.querySelectorAll(".char");
    gsap.fromTo(
      chars,
      { y: 140, opacity: 0, rotate: 8 },
      {
        y: 0,
        opacity: 1,
        rotate: 0,
        duration: 1.1,
        stagger: 0.045,
        ease: "back.out(1.6)",
        delay: 0.2,
      }
    );

    gsap.fromTo(
      ".hero-sub",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, delay: 1.1, ease: "power3.out" }
    );

    gsap.fromTo(
      ".hero-countdown",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, delay: 1.3, ease: "power3.out" }
    );

    gsap.fromTo(
      ".hero-visual",
      { opacity: 0, scale: 0.85, rotate: -6 },
      { opacity: 1, scale: 1, rotate: 0, duration: 1.2, delay: 0.6, ease: "power3.out" }
    );

    gsap.to(".scroll-cue", {
      y: 10,
      repeat: -1,
      yoyo: true,
      duration: 1,
      ease: "sine.inOut",
      delay: 1.6,
    });

    // gentle parallax drift on the hero blob as you scroll away
    gsap.to(blobRef.current, {
      y: 220,
      rotate: 25,
      scale: 1.15,
      ease: "none",
      scrollTrigger: {
        trigger: titleRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    // whole hero zooms in while pinned in place — it only releases and
    // scrolls into the artist section once the zoom finishes. Once released,
    // the section's own height collapses immediately so the artist section
    // sits right where the pin ends, with no dead scroll gap in between.
    const heroScrollTrigger = {
      trigger: sectionRef.current,
      start: "top top",
      end: "+=55%",
      scrub: 1,
      pin: true,
      pinSpacing: true,
      onLeave: () => {
        gsap.set(sectionRef.current, {
          minHeight: 0,
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          overflow: "hidden",
        });
      },
      onEnterBack: () => {
        gsap.set(sectionRef.current, {
          minHeight: "100vh",
          height: "auto",
          paddingTop: 20,
          paddingBottom: 40,
          overflow: "visible",
        });
      },
    };

    gsap.to([contentRef.current, ".scroll-cue"], {
      scale: 1.55,
      opacity: 0,
      ease: "none",
      scrollTrigger: heroScrollTrigger,
    });

    // the artist photo crossfades + zooms in on the exact same scroll
    // range as the hero fading out — same trigger/start/end/scrub values,
    // so the two are perfectly synced with no gap in between
    gsap.fromTo(
      previewRef.current,
      { opacity: 0, scale: 1.15 },
      {
        opacity: 1,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=55%",
          scrub: 1,
        },
      }
    );

    // GSAP's pin can be measured against a page height that later grows
    // (fonts/images loading in), leaving a leftover transform offset on
    // this section even while sitting at the very top of the page. If
    // we're still at scroll 0 once everything has settled, force it back
    // to a clean, untransformed state instead of waiting for a real scroll
    // event to correct it.
    const clearStaleTransform = () => {
      const scrollPos = window.__lenis?.scroll ?? window.scrollY;
      if (scrollPos < 2) {
        gsap.set(sectionRef.current, { clearProps: "transform" });
      }
    };
    window.addEventListener("load", clearStaleTransform);
    const staleTimers = [400, 1000, 2000].map((ms) => setTimeout(clearStaleTransform, ms));

    return () => {
      window.removeEventListener("load", clearStaleTransform);
      staleTimers.forEach(clearTimeout);
    };
  }, []);

  const name = config.fest.name.split("");

  return (
    <section
      ref={sectionRef}
      className="section"
      style={{
        minHeight: "100vh",
        paddingTop: "20px",
        paddingBottom: "40px",
        position: "relative",
      }}
    >
      <div
        ref={contentRef}
        className="hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          alignItems: "center",
          gap: "20px",
          minHeight: "calc(100vh - 60px)",
          transformOrigin: "center center",
        }}
      >
      <div ref={blobRef} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Blobs variant="hero" />
      </div>

      <div
        ref={previewRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          opacity: 0,
        }}
      >
        <img
          src="/images/artist-main.jpg"
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 20%",
            display: "block",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          {config.fest.collegeShort} presents
        </p>

        <h1
          ref={titleRef}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3.2rem, 13vw, 9.5rem)",
            lineHeight: 0.9,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {name.map((c, i) => (
            <span
              key={i}
              className="char"
              style={{
                display: "inline-block",
                color: i % 3 === 1 ? "var(--accent-1)" : "var(--text)",
              }}
            >
              {c}
            </span>
          ))}
        </h1>

        <p
          className="hero-sub"
          style={{
            fontSize: "clamp(1.1rem, 2.4vw, 1.6rem)",
            color: "var(--text-muted)",
            marginTop: 24,
            maxWidth: 560,
          }}
        >
          {config.artist.name} live in concert &mdash; {config.fest.date}, {config.fest.time}
        </p>

        <div
          className="hero-countdown"
          style={{ display: "flex", gap: "28px", marginTop: 48, flexWrap: "wrap" }}
        >
          {[
            ["Days", time.d],
            ["Hours", time.h],
            ["Mins", time.m],
            ["Secs", time.s],
          ].map(([label, val]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 5vw, 3.2rem)",
                  color: "var(--accent-2)",
                  lineHeight: 1,
                }}
              >
                {String(val).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginTop: 6,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }} className="hero-visual">
        <HeroVisual />
      </div>
      </div>

      <div
        className="scroll-cue"
        style={{
          position: "absolute",
          bottom: 40,
          left: "8vw",
          fontSize: 13,
          color: "var(--text-muted)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        ↓ scroll
      </div>
    </section>
  );
}