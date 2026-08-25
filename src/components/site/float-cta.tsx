"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Persistent floating call-to-action: appears past one viewport of scrolling
 * (same reveal mechanics as ScrollTop, stacked directly above it), pulses
 * gently to draw the eye without being obnoxious, and is hidden on /contact
 * itself (no point inviting someone to the page they're already on).
 */
export function FloatCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    const id = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (pathname === "/contact") return null;

  return (
    <Link
      href="/contact"
      className={"float-cta" + (visible ? " in" : "")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <span className="float-cta-pulse" aria-hidden="true" />
      <span className="float-cta-label">Prendre 20 minutes</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="float-cta-arrow"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
