"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Logo from "./Logo";

export default function Header() {
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: "power3.out" }
    );

    // fade in a solid backing once the user scrolls a bit
    const onScroll = () => {
      if (!ref.current) return;
      const scrolled = window.scrollY > 60;
      ref.current.style.background = scrolled ? "rgba(26, 11, 46, 0.85)" : "transparent";
      ref.current.style.backdropFilter = scrolled ? "blur(10px)" : "none";
      ref.current.style.borderBottom = scrolled
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid transparent";
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (selector) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      ref={ref}
      className="header-bar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 8vw",
        transition: "background 0.3s, border-color 0.3s",
        gap: 12,
      }}
    >
      <button onClick={() => scrollTo("body")} className="header-logo" style={{ display: "flex", minWidth: 0 }}>
        <Logo size={224} />
      </button>

      <button
        onClick={() => scrollTo("#lucky-ticket")}
        className="btn header-get-pass"
        style={{ padding: "10px 22px", fontSize: 14 }}
      >
        Get pass
      </button>
    </header>
  );
}