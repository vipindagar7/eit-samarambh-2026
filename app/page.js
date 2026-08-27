"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CursorGlow from "@/components/CursorGlow";
import Particles from "@/components/Particles";
import MusicPlayer from "@/components/MusicPlayer";
import MusicNotice from "@/components/MusicNotice";
import { MusicProvider } from "@/components/MusicContext";
import EntryGate from "@/components/EntryGate";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ArtistReveal from "@/components/ArtistReveal";
import EventDetails from "@/components/EventDetails";
import Schedule from "@/components/Schedule";
import Gallery from "@/components/Gallery";
import Coordinators from "@/components/Coordinators";
import Sponsors from "@/components/Sponsors";
import ContactUs from "@/components/ContactUs";
import LuckyTicket from "@/components/LuckyTicket";
import MarketingHype from "@/components/MarketingHype";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  // Native wheel scrolling can feel abrupt/fast on many setups. This damps
  // each wheel tick to a calmer, more controlled speed — no inertia, no lag,
  // just a slower per-tick movement. Desktop-only (wheel doesn't fire on
  // touch), so mobile scrolling is untouched.
  useEffect(() => {
    const SPEED = 0.55;
    let targetY = window.scrollY;
    let ticking = false;

    const clampY = (y) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return Math.max(0, Math.min(y, max));
    };

    const onWheel = (e) => {
      if (e.ctrlKey) return; // let pinch-zoom through untouched
      e.preventDefault();
      targetY = clampY(targetY + e.deltaY * SPEED);
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          window.scrollTo(0, targetY);
          ticking = false;
        });
      }
    };

    const onScroll = () => {
      if (!ticking) targetY = window.scrollY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Images/fonts/late layout shifts leave ScrollTrigger positions stale on
  // first load. Refreshing once everything has genuinely settled fixes it
  // for every scroll-driven section at once.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    window.addEventListener("load", refresh);

    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh);
    }

    const imgs = Array.from(document.images);
    const pending = imgs.filter((img) => !img.complete);
    pending.forEach((img) => img.addEventListener("load", refresh));

    const timers = [300, 900, 1800].map((ms) => setTimeout(refresh, ms));

    return () => {
      window.removeEventListener("load", refresh);
      pending.forEach((img) => img.removeEventListener("load", refresh));
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <MusicProvider>
      <EntryGate />
      <div className="grain" />
      <CursorGlow />
      <Particles />
      <MusicNotice />
      <Header />
      <Hero />
      <ArtistReveal />
      <EventDetails />
      <Schedule />
      <Gallery />
      <Coordinators />
      <Sponsors />
      <ContactUs />
      <LuckyTicket />
      <Footer />
      <MusicPlayer />
    </MusicProvider>
  );
}