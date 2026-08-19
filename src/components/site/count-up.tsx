"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/** Split "×3", "6 h", "9 sem." into prefix / number / suffix (once). */
function parse(value: string) {
  const m = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!m) return null;
  return { prefix: m[1]!, target: Number(m[2]!.replace(",", ".")), suffix: m[3]! };
}

/**
 * Animates the numeric part of a metric from 0 to its value when scrolled into
 * view. Reduced-motion → jumps straight to the value. The parsed value has a
 * stable identity (useMemo) so re-renders during the animation never restart it.
 */
export function CountUp({ value }: { value: string }) {
  const parsed = useMemo(() => parse(value), [value]);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!parsed) return;
    const el = ref.current;
    if (!el) return;
    const { target } = parsed;
    const run = () => {
      if (started.current) return;
      started.current = true;
      io.disconnect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setN(target);
        return;
      }
      const start = performance.now();
      const dur = 1100;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        setN(target * (1 - (1 - p) ** 3));
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
    // Already on screen at mount → start next frame (IO won't re-notify).
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) requestAnimationFrame(run);
    return () => io.disconnect();
  }, [parsed]);

  if (!parsed) return <span>{value}</span>;
  const isInt = Number.isInteger(parsed.target);
  const shown = isInt ? Math.round(n) : n.toFixed(1);
  return (
    <span ref={ref}>
      {parsed.prefix}
      {shown}
      {parsed.suffix}
    </span>
  );
}
