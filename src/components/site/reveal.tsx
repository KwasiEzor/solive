"use client";
import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal (fade + rise) via IntersectionObserver. prefers-reduced-motion
 * (SLV-112) is handled in CSS: reduced users always see the final state.
 */
export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "li" | "article" | "section" | "figure";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    // Fallback for suspended IO: reveal on next frame if already on screen.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      requestAnimationFrame(() => setShown(true));
    }
    return () => io.disconnect();
  }, []);

  // Cast to a single concrete tag so the ref prop type is unambiguous.
  const Tag = as as "div";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`reveal${shown ? " in" : ""}${className ? ` ${className}` : ""}`}
      style={{ transitionDelay: shown ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
