"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";
import ArtistCollage from "./ArtistCollage";
import DockedMusicPlayer from "./DockedMusicPlayer";

gsap.registerPlugin(ScrollTrigger);

export default function ArtistReveal() {
  const sectionRef = useRef(null);
  const barRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const onPlaying = (e) => setPlaying(e.detail);
    window.addEventListener("samarambh:playing-state", onPlaying);
    return () => window.removeEventListener("samarambh:playing-state", onPlaying);
  }, []);

  useEffect(() => {
    const bars = barRef.current?.querySelectorAll(".dj-bar");
    if (!bars) return;
    if (playing) {
      bars.forEach((b, i) =>
        gsap.to(b, {
          scaleY: 0.2 + Math.random() * 0.9,
          duration: 0.3 + Math.random() * 0.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.03,
        })
      );
    } else {
      gsap.killTweensOf(bars);
      gsap.to(bars, { scaleY: 0.15, duration: 0.4 });
    }
  }, [playing]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".artist-text > *",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            toggleActions: "restart none restart reverse",
          },
        }
      );

      gsap.fromTo(
        ".dj-waveform",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            toggleActions: "restart none restart reverse",
          },
        }
      );

      // marquee
      gsap.to(".marquee-track", {
        xPercent: -50,
        repeat: -1,
        duration: 18,
        ease: "linear",
      });

      // tell the music player to start once this section is actually in view
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 90%",
        once: true,
        onEnter: () => window.dispatchEvent(new Event("samarambh:play-teaser")),
      });

      // once the user scrolls past this section, the fixed player sticks to the bottom
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "bottom 70%",
        onEnter: () => window.dispatchEvent(new Event("samarambh:stick-player")),
        onLeaveBack: () => window.dispatchEvent(new Event("samarambh:unstick-player")),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const songs = [...config.artist.songs, ...config.artist.songs];

  return (
    <section ref={sectionRef} style={{ position: "relative" }}>
      <ArtistCollage>
        <div
          className="artist-text-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 50,
            alignItems: "end",
          }}
        >
          <div className="artist-text" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <p className="eyebrow" style={{ marginBottom: 16 }}>{config.artist.role}</p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 6vw, 4rem)",
                lineHeight: 1,
                marginBottom: 24,
              }}
            >
              {config.artist.name}
            </h2>

            <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: 28 }}>
              {config.artist.bio}
            </p>

            <div
              className="dj-waveform"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div ref={barRef} style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32 }}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="dj-bar"
                    style={{
                      width: 4,
                      height: 32,
                      borderRadius: 2,
                      background: i % 3 === 0 ? "var(--accent-2)" : "var(--accent-1)",
                      transform: "scaleY(0.15)",
                      transformOrigin: "bottom",
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 13, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                {playing ? "teaser playing" : "tap the player to listen"}
              </span>
            </div>
          </div>

          <DockedMusicPlayer />
        </div>
      </ArtistCollage>

      <div
        className="section"
        style={{
          overflow: "hidden",
          paddingTop: 20,
          paddingBottom: 20,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div className="marquee-track" style={{ display: "flex", width: "max-content" }}>
          {songs.map((s, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                color: i % 2 === 0 ? "var(--accent-2)" : "var(--text-muted)",
                padding: "0 32px",
                whiteSpace: "nowrap",
              }}
            >
              {s} ✦
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}