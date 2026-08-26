"use client";

import { useEffect, useState } from "react";
import config from "@/lib/config";

// Uses the real logo at /public/images/logo.png if present,
// falls back to a monogram badge if the file isn't found.
const logoUrl = "/images/logo.png";

export default function Logo({ size = 40 }) {
  const [hasLogo, setHasLogo] = useState(false);

  useEffect(() => {
    if (!logoUrl) return;
    const img = new Image();
    img.onload = () => setHasLogo(true);
    img.onerror = () => setHasLogo(false);
    img.src = logoUrl;
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {hasLogo ? (
        <img
          src={logoUrl}
          alt={config.fest.collegeShort}
          style={{
            width: size,
            height: "auto",
            objectFit: "contain",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          className="logo-fallback"
          style={{
            width: size,
            height: size,
            borderRadius: "30%",
            background: "linear-gradient(145deg, var(--accent-1), var(--accent-3))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "var(--font-display)",
            fontSize: size * 0.42,
            color: "var(--text)",
            boxShadow: "0 4px 12px -4px rgba(0,0,0,0.5)",
          }}
        >
          E
        </div>
      )}
    </div>
  );
}