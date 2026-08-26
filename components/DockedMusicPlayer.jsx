"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useMusic, playlist } from "./MusicContext";

// Radio-styled player that lives inline in the artist section.
// Fades out once the sticky (small) player takes over further down the page.
export default function DockedMusicPlayer() {
  const { current, trackIndex, playing, blocked, progress, stuck, togglePlay, playTrack, nextTrack, prevTrack } =
    useMusic();
  const barRef = useRef(null);
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const rectRef = useRef(null);

  useEffect(() => {
    const bars = barRef.current?.querySelectorAll(".docked-eq-bar");
    if (!bars) return;
    if (playing) {
      bars.forEach((b, i) =>
        gsap.to(b, {
          scaleY: 0.2 + Math.random() * 0.9,
          duration: 0.3 + Math.random() * 0.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.04,
        })
      );
    } else {
      gsap.killTweensOf(bars);
      gsap.to(bars, { scaleY: 0.15, duration: 0.3 });
    }
  }, [playing]);

  useEffect(() => {
    const inner = innerRef.current;
    const wrapper = wrapRef.current;
    if (!inner || !wrapper) return;

    if (stuck) {
      const rect = inner.getBoundingClientRect();
      rectRef.current = rect;
      wrapper.style.height = rect.height + "px";

      gsap.set(inner, {
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        margin: 0,
        zIndex: 70,
      });

      const targetWidth = Math.min(window.innerWidth * 0.9, 340);
      const targetHeight = 78;
      const targetLeft = window.innerWidth - 20 - targetWidth;
      const targetTop = window.innerHeight - 20 - targetHeight;

      gsap.to(inner, {
        top: targetTop,
        left: targetLeft,
        width: targetWidth,
        height: targetHeight,
        borderRadius: 16,
        padding: "12px 16px",
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(inner, { opacity: 0, pointerEvents: "none" });
        },
      });

      gsap.to(".radio-content", { opacity: 0, duration: 0.3, ease: "power1.in" });
    } else if (rectRef.current) {
      const rect = rectRef.current;
      gsap.set(inner, { opacity: 1, pointerEvents: "auto" });
      gsap.to(inner, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: "auto",
        borderRadius: 26,
        padding: "22px 22px 8px",
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(inner, {
            clearProps: "position,top,left,width,height,margin,zIndex",
          });
          wrapper.style.height = "";
        },
      });
      gsap.to(".radio-content", { opacity: 1, duration: 0.4, delay: 0.25, ease: "power2.out" });
    }
  }, [stuck]);

  if (playlist.length === 0) return null;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div
        ref={innerRef}
        className="radio-player"
        style={{
          background: "linear-gradient(155deg, var(--bg-alt), #150a26 70%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 26,
          padding: "22px 22px 8px",
          position: "relative",
          overflow: "hidden",
        }}
      >
      <div className="radio-content">
      {/* speaker grille texture */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "42%",
          height: "100%",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px)",
          backgroundSize: "10px 10px",
          pointerEvents: "none",
        }}
      />

      {/* top row: knob + title + eq */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
        <button
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className={blocked && !playing ? "play-pulse" : ""}
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, var(--accent-1), #99253f 75%)",
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 10px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.25)",
          }}
        >
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="4" width="5" height="16" rx="1" />
              <rect x="14" y="4" width="5" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4l15 8-15 8z" />
            </svg>
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-2)",
              marginBottom: 4,
            }}
          >
            On air
          </p>
          <p style={{ fontSize: 16, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {current?.title || "—"}
          </p>
        </div>

        <div ref={barRef} style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 28, flexShrink: 0 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="docked-eq-bar"
              style={{
                width: 3,
                height: 28,
                borderRadius: 2,
                background: i % 2 === 0 ? "var(--accent-2)" : "var(--accent-1)",
                transform: "scaleY(0.15)",
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
      </div>

      {/* tuner-dial style progress bar */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 18,
          height: 6,
          borderRadius: 3,
          background: "rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: "100%",
            background: "linear-gradient(90deg, var(--accent-2), var(--accent-1))",
            transition: "width 0.2s linear",
          }}
        />
      </div>
      <p style={{ position: "relative", zIndex: 1, fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
        {blocked ? "tap play to start" : playing ? "teaser playing" : "paused"}
      </p>

      {/* playlist */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 14,
          maxHeight: 200,
          overflowY: "auto",
        }}
      >
        {playlist.map((track, i) => (
          <button
            key={track.title}
            onClick={() => playTrack(i)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 8px",
              borderRadius: 10,
              textAlign: "left",
              background: i === trackIndex ? "rgba(255,255,255,0.07)" : "transparent",
              transition: "background 0.2s",
            }}
          >
            <span
              style={{
                width: 20,
                fontSize: 12,
                color: i === trackIndex ? "var(--accent-2)" : "var(--text-muted)",
                fontWeight: i === trackIndex ? 600 : 400,
                flexShrink: 0,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontSize: 14,
                color: i === trackIndex ? "var(--text)" : "var(--text-muted)",
                fontWeight: i === trackIndex ? 600 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {track.title}
            </span>
            {i === trackIndex && playing && (
              <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--accent-2)", flexShrink: 0 }}>
                playing
              </span>
            )}
          </button>
        ))}
      </div>
      </div>
      </div>
    </div>
  );
}