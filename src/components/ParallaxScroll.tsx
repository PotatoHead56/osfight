"use client";

import { useEffect } from "react";

// Publishes the scroll position as --scroll-y so the parallax-x / parallax-y
// utilities in globals.css can move layers at their own --speed.
export function ParallaxScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      root.style.setProperty("--scroll-y", String(window.scrollY));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      root.style.removeProperty("--scroll-y");
    };
  }, []);

  return null;
}
