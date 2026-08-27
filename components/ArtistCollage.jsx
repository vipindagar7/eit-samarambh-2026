"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MAIN_IMG = "/images/artist-main.jpg";

// two accent photos float on the left, two on the right — each with its
// own distinct entrance animation
const leftThumbs = [
  { file: "collage-1.jpg", anim: "slideLeft" },
  { file: "collage-2.jpg", anim: "flip" },
];
const rightThumbs = [
  { file: "collage-3.jpg", anim: "zoomSpin" },
  { file: "collage-4.jpg", anim: "slideRight" },
];

const animFrom = {
  slideLeft: { x: -140, opacity: 0, rotate: -20 },
  slideRight: { x: 140, opacity: 0, rotate: 20 },
  flip: { rotateY: 100, opacity: 0, scale: 0.7 },
  zoomSpin: { scale: 0.2, opacity: 0, rotate: -60 },
};

function ThumbGroup({ side, items, loadedThumbs }) {
  return (
    <div
      className={`collage-group collage-group-${side}`}
      style={{
        position: "absolute",
        top: "8%",
        [side]: "4%",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        gap: "min(3vw, 24px)",
      }}
    >
      {items.map((t) => (
        <div
          key={t.file}
          className="collage-thumb"
          data-anim={t.anim}
          style={{
            width: "min(13vw, 130px)",
            aspectRatio: "3 / 4",
            borderRadius: 16,
            overflow: "hidden",
            border: "3px solid var(--bg)",
            boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <img
            src={`/images/${t.file}`}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
              opacity: loadedThumbs[t.file] ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function ArtistCollage({ children }) {
  const wrapRef = useRef(null);
  const [mainLoaded, setMainLoaded] = useState(false);
  const [loadedThumbs, setLoadedThumbs] = useState({});

  useEffect(() => {
    const img = new Image();
    img.onload = () => setMainLoaded(true);
    img.src = MAIN_IMG;

    [...leftThumbs, ...rightThumbs].forEach((t) => {
      const ti = new Image();
      ti.onload = () => setLoadedThumbs((l) => ({ ...l, [t.file]: true }));
      ti.src = `/images/${t.file}`;
    });
  }, []);

  useEffect(() => {
    // Note: the main photo itself has no entrance animation here — Hero's
    // crossfade preview (a matching image that fades+zooms in as Hero fades
    // out) already handles the reveal, ending exactly where this one starts.
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".collage-thumb").forEach((thumb, i) => {
        const anim = thumb.dataset.anim;
        gsap.set(thumb, { transformPerspective: 800 });
        gsap.fromTo(
          thumb,
          animFrom[anim],
          {
            x: 0,
            opacity: 1,
            rotate: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.9,
            delay: 0.3 + i * 0.15,
            ease: anim === "zoomSpin" ? "back.out(2)" : "power3.out",
            scrollTrigger: {
              trigger: wrapRef.current,
              start: "top 70%",
              toggleActions: "restart none restart reverse",
            },
          }
        );

        // continuous floating drift
        gsap.to(thumb, {
          y: i % 2 === 0 ? -14 : 14,
          duration: 3 + i * 0.4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 1.5 + i * 0.2,
        });

        thumb.addEventListener("mouseenter", () =>
          gsap.to(thumb, { scale: 1.08, duration: 0.3, ease: "power2.out" })
        );
        thumb.addEventListener("mouseleave", () =>
          gsap.to(thumb, { scale: 1, duration: 0.4, ease: "power3.out" })
        );
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="collage-wrap"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        marginLeft: "calc(-50vw + 50%)",
        overflow: "hidden",
        background: "var(--bg-alt)",
      }}
    >
      <div className="collage-main" style={{ position: "absolute", inset: 0 }}>
        <img
          src={MAIN_IMG}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center top",
            display: "block",
            opacity: mainLoaded ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, var(--bg) 0%, var(--bg) 15%, rgba(26,11,46,0.85) 42%, rgba(26,11,46,0.3) 65%, transparent 85%)",
          }}
        />
      </div>

      <ThumbGroup side="left" items={leftThumbs} loadedThumbs={loadedThumbs} />
      <ThumbGroup side="right" items={rightThumbs} loadedThumbs={loadedThumbs} />

      {children && (
        <>
          <div
            className="text-overlay-fade"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "45%",
              zIndex: 4,
              background:
                "linear-gradient(to top, var(--bg) 0%, rgba(26,11,46,0.9) 45%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
          <div
            className="artist-text-overlay"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
              padding: "0 8vw 56px",
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}