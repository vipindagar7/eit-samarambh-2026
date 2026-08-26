"use client";

import config from "@/lib/config";
import Logo from "./Logo";

export default function Footer() {
  const socials = Object.entries(config.socials).filter(([, url]) => url);

  return (
    <footer
      className="section"
      style={{
        paddingTop: 20,
        paddingBottom: 20,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Logo size={264} />
      </div>

      {socials.length > 0 && (
        <div style={{ display: "flex", gap: 20 }}>
          {socials.map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--text-muted)", fontSize: 13, textTransform: "capitalize" }}
            >
              {name}
            </a>
          ))}
        </div>
      )}
    </footer>
  );
}
