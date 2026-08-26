"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useMusic, playlist } from "./MusicContext";

// Small fixed player that sticks to the bottom-right once the user
// scrolls past the artist section (the big docked player lives there).
export default function MusicPlayer() {
  const { current, playing, blocked, progress, stuck, visible, togglePlay, nextTrack, prevTrack } =
    useMusic();
  const barRef = useRef(null);
  const wrapRef = useRef(null);
  const hasEnteredRef = useRef(false);

  // entrance animation — hangs down on a rope, swings, then settles (runs once)
  useEffect(() => {
    if (!stuck || !wrapRef.current || hasEnteredRef.current) return;
    hasEnteredRef.current = true;

    const rope = wrapRef.current.querySelector(".player-rope");
    gsap.set(wrapRef.current, { transformOrigin: "top center" });

    const tl = gsap.timeline();
    tl.fromTo(rope, { scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: "power2.out" })
      .fromTo(
        wrapRef.current,
        { y: -80, opacity: 0, rotate: -8 },
        { y: 0, opacity: 1, rotate: 6, duration: 0.6, ease: "power2.out" },
        "-=0.1"
      )
      .to(wrapRef.current, { rotate: -4, duration: 0.5, ease: "sine.inOut" })
      .to(wrapRef.current, { rotate: 2.5, duration: 0.5, ease: "sine.inOut" })
      .to(wrapRef.current, { rotate: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" })
      .to(wrapRef.current, {
        rotate: 1.5,
        duration: 2.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
  }, [stuck]);

  // spin equalizer bars when playing
  useEffect(() => {
    const bars = barRef.current?.querySelectorAll(".eq-bar");
    if (!bars) return;
    if (playing) {
      bars.forEach((b, i) =>
        gsap.to(b, {
          scaleY: 0.3 + Math.random() * 0.9,
          duration: 0.3 + Math.random() * 0.3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.05,
        })
      );
    } else {
      gsap.killTweensOf(bars);
      gsap.to(bars, { scaleY: 0.25, duration: 0.3 });
    }
  }, [playing]);

  if (playlist.length === 0) return null;

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed",
        bottom: stuck ? 20 : "-140px",
        right: 20,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: "min(90vw, 340px)",
        opacity: visible && stuck ? 1 : 0,
        transition: stuck
          ? "bottom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease 0.55s"
          : "bottom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease",
        pointerEvents: visible && stuck ? "auto" : "none",
      }}
    >
      <div
        className="player-rope"
        style={{
          width: 2,
          height: 26,
          background: "var(--text-muted)",
          transformOrigin: "top",
        }}
      />

      <div
        style={{
          marginTop: 6,
          width: "100%",
          background: "var(--bg-alt)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 20px 50px -20px rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
        }}
      >
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--accent-1)",
            color: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="4" width="5" height="16" rx="1" />
              <rect x="14" y="4" width="5" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4l15 8-15 8z" />
            </svg>
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {current?.title || "—"}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            {blocked ? "tap play to start" : playing ? "now playing" : "paused"}
          </p>
          <div
            style={{
              marginTop: 6,
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.12)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                height: "100%",
                background: "var(--accent-2)",
                transition: "width 0.2s linear",
              }}
            />
          </div>
        </div>

        <div ref={barRef} style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="eq-bar"
              style={{
                width: 3,
                height: 20,
                borderRadius: 2,
                background: "var(--accent-2)",
                transform: "scaleY(0.25)",
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button onClick={prevTrack} aria-label="Previous track" style={{ fontSize: 10, color: "var(--text-muted)" }}>
            prev
          </button>
          <button onClick={nextTrack} aria-label="Next track" style={{ fontSize: 10, color: "var(--text-muted)" }}>
            next
          </button>
        </div>
      </div>
    </div>
  );
}
