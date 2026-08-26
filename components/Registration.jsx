"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import config from "@/lib/config";
import RegistrationForm from "./RegistrationForm";

gsap.registerPlugin(ScrollTrigger);

export default function Registration() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".reg-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 70%",
            toggleActions: "restart none restart reverse",
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  if (!config.registration.enabled) return null;

  return (
    <section id="register" ref={ref} className="section">
      <RegistrationForm />
    </section>
  );
}
