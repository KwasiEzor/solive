"use client";
import { useEffect, useState } from "react";

/**
 * Back-to-top button: fades in past one viewport of scrolling, fades out near
 * the top. Keyboard-operable, labelled, and honours prefers-reduced-motion
 * (jumps instead of smooth-scrolling).
 */
export function ScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    const id = requestAnimationFrame(onScroll); // initial state, eslint-safe
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      className={"scroll-top" + (visible ? " in" : "")}
      onClick={toTop}
      aria-label="Remonter en haut"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
