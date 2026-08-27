"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MAIN_IMG = "/images/artist-main.jpg";

// floating accent photos on the image itself — top corners only, so they
// never collide with the text overlay anchored at the bottom. The two small
// ones sit side by side beneath the white-clothes photo (top-left cluster).
const thumbFiles = ["collage-1.jpg", "collage-2.jpg", "collage-3.jpg", "collage-4.jpg"];

const animFrom = {
  slideLeft: { x: -140, opacity: 0, rotate: -20 },
  slideRight: { x: 140, opacity: 0, rotate: 20 },
  flip: { rotateY: 100, opacity: 0, scale: 0.7 },
  zoomSpin: { scale: 0.2, opacity: 0, rotate: -60 },
};

export default function ArtistCollage({ children }) {
  const wrapRef = useRef(null);
  const [mainLoaded, setMainLoaded] = useState(false);
  const [loadedThumbs, setLoadedThumbs] = useState({});

  useEffect(() => {
    const img = new Image();
    img.onload = () => setMainLoaded(true);
    img.src = MAIN_IMG;

    thumbFiles.forEach((file) => {
      const ti = new Image();
      ti.onload = () => setLoadedThumbs((l) => ({ ...l, [file]: true }));
      ti.src = `/images/${file}`;
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

        gsap.to(thumb, {
          y: i % 2 === 0 ? -10 : 10,
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
            objectFit: "cover",
            objectPosition: "center 20%",
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
              "linear-gradient(to top, var(--bg) 0%, rgba(26,11,46,0.75) 30%, rgba(26,11,46,0.15) 55%, transparent 75%)",
          }}
        />
      </div>

      <div
        className="collage-cluster"
        style={{
          position: "absolute",
          top: "6%",
          left: "4%",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          className="collage-thumb"
          data-anim="slideLeft"
          style={{
            width: "min(22vw, 190px)",
            aspectRatio: "3 / 4",
            borderRadius: 18,
            overflow: "hidden",
            border: "3px solid var(--bg)",
            boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6)",
            cursor: "pointer",
          }}
        >
          <img
            src="/images/collage-1.jpg"
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: loadedThumbs["collage-1.jpg"] ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {["collage-3.jpg", "collage-4.jpg"].map((file, i) => (
            <div
              key={file}
              className="collage-thumb"
              data-anim={i === 0 ? "flip" : "zoomSpin"}
              style={{
                width: "min(10.5vw, 90px)",
                aspectRatio: "1 / 1",
                borderRadius: 12,
                overflow: "hidden",
                border: "2px solid var(--bg)",
                boxShadow: "0 12px 24px -14px rgba(0,0,0,0.6)",
                cursor: "pointer",
              }}
            >
              <img
                src={`/images/${file}`}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  opacity: loadedThumbs[file] ? 1 : 0,
                  transition: "opacity 0.3s",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className="collage-thumb"
        data-anim="slideRight"
        style={{
          position: "absolute",
          top: "6%",
          right: "4%",
          width: "min(22vw, 190px)",
          aspectRatio: "3 / 4",
          borderRadius: 18,
          overflow: "hidden",
          border: "3px solid var(--bg)",
          boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6)",
          zIndex: 2,
          cursor: "pointer",
        }}
      >
        <img
          src="/images/collage-2.jpg"
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: loadedThumbs["collage-2.jpg"] ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        />
      </div>

      {children && (
        <div
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
      )}
    </div>
  );
}