"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";

// Hand-drawn-feel accent shapes — animated: continuous shape morph,
// slow rotation/drift, gentle scale pulse, plus a smaller orbiting
// companion blob so the motion reads clearly rather than a static blur.
const heroPaths = [
  "M475,120 C620,90 780,180 830,320 C880,460 810,610 690,700 C570,790 400,810 290,730 C180,650 130,480 170,340 C210,200 330,150 475,120 Z",
  "M520,150 C660,100 800,230 820,370 C845,520 760,640 630,715 C500,790 350,780 260,680 C165,575 150,420 210,300 C270,180 380,200 520,150 Z",
  "M440,95 C610,70 810,150 860,310 C905,455 815,640 665,725 C530,800 360,815 255,705 C150,600 120,430 195,300 C255,195 300,120 440,95 Z",
];

const altPaths = [
  "M400,90 C540,110 660,220 690,360 C720,500 640,650 500,710 C360,770 200,730 130,610 C60,490 90,320 190,220 C290,120 260,70 400,90 Z",
  "M360,55 C520,45 690,180 720,340 C755,510 650,690 490,750 C340,805 190,740 120,600 C50,460 100,270 210,180 C310,95 220,65 360,55 Z",
  "M430,120 C560,140 660,250 675,380 C695,520 605,650 470,705 C340,760 200,705 145,585 C90,465 135,310 225,225 C315,140 310,100 430,120 Z",
];

export default function Blobs({ variant = "hero" }) {
  const pathRef = useRef(null);
  const groupRef = useRef(null);
  const orbitRef = useRef(null);
  const reactId = useId();
  const uid = useRef(`${variant}-${reactId.replace(/:/g, "")}`);
  const paths = variant === "hero" ? heroPaths : altPaths;

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 4.5, ease: "sine.inOut" } });
    tl.to(pathRef.current, { attr: { d: paths[1] } })
      .to(pathRef.current, { attr: { d: paths[2] } })
      .to(pathRef.current, { attr: { d: paths[0] } });

    gsap.to(groupRef.current, {
      rotate: variant === "hero" ? 18 : -16,
      duration: 9,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      transformOrigin: "50% 50%",
    });

    gsap.to(groupRef.current, {
      x: variant === "hero" ? -35 : 35,
      y: variant === "hero" ? 25 : -25,
      scale: 1.12,
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 0.4,
    });

    gsap.to(groupRef.current, {
      opacity: variant === "hero" ? 0.65 : 0.48,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    if (orbitRef.current) {
      gsap.to(orbitRef.current, {
        rotate: 360,
        duration: 22,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });
      gsap.to(orbitRef.current, {
        scale: 0.85,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    return () => tl.kill();
  }, [variant, paths]);

  const gradId = `blob-grad-${uid.current}`;
  const glowId = `blob-glow-${uid.current}`;

  if (variant === "hero") {
    return (
      <svg
        className="blob-hero"
        viewBox="0 0 1000 1000"
        style={{
          position: "absolute",
          top: "-10%",
          right: "-15%",
          width: "70%",
          height: "auto",
          zIndex: 0,
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-3)" />
            <stop offset="100%" stopColor="var(--accent-1)" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <g ref={groupRef} style={{ opacity: 0.5 }}>
          <path ref={pathRef} fill={`url(#${gradId})`} d={paths[0]} filter={`url(#${glowId})`} />
        </g>
        <circle ref={orbitRef} cx="150" cy="750" r="70" fill="var(--accent-2)" opacity="0.3" />
      </svg>
    );
  }

  return (
    <svg
      className="blob-alt"
      viewBox="0 0 800 800"
      style={{
        position: "absolute",
        bottom: "-20%",
        left: "-10%",
        width: "55%",
        height: "auto",
        zIndex: 0,
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent-1)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <g ref={groupRef} style={{ opacity: 0.35 }}>
        <path ref={pathRef} fill={`url(#${gradId})`} d={paths[0]} filter={`url(#${glowId})`} />
      </g>
      <circle ref={orbitRef} cx="650" cy="120" r="55" fill="var(--accent-3)" opacity="0.28" />
    </svg>
  );
}