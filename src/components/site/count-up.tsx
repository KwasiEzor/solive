"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Animates the numeric part of a metric string (e.g. "×3", "6 h", "9 sem.")
 * from 0 to its value when scrolled into view. Reduced-motion → jumps to the
 * final value with no animation (decided inside the observer callback).
 */
export function CountUp({ value }: { value: string }) {
  const match = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const target = match ? Number(match[2]!.replace(",", ".")) : 0;
  const [n, setN] = useState(match ? 0 : target);

  useEffect(() => {
    if (!match) return;
    const el = ref.current;
    if (!el) return;
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      io.disconnect();
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) {
        setN(target);
        return;
      }
      const start = performance.now();
      const dur = 1100;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - (1 - p) ** 3;
        setN(target * eased);
        if (p < 1) requestAnimationFrame(tick);
        else setN(target);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) run();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    // Fallback for suspended IO: if already on screen, start next frame.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) requestAnimationFrame(run);
    return () => io.disconnect();
  }, [match, target]);

  if (!match) return <span>{value}</span>;
  const isInt = Number.isInteger(target);
  const shown = isInt ? Math.round(n) : n.toFixed(1);
  return (
    <span ref={ref}>
      {match[1]}
      {shown}
      {match[3]}
    </span>
  );
}
