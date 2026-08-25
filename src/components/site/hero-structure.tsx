"use client";
import { useEffect, useRef } from "react";

/**
 * Bespoke hero visual: a structural frame (posts + joists — the "solive"
 * itself) that draws itself in on load, then holds. Pure SVG + CSS, no 3D
 * engine — draw-in uses normalized `pathLength` so every segment animates at
 * the same visual speed regardless of its pixel length. A subtle per-layer
 * parallax on mouse move (desktop only) fakes depth cheaply. Replaces the
 * previous stock-photo hero background with something that's actually about
 * Solive rather than generic "tech" texture.
 */
export function HeroStructure() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--px", px.toFixed(3));
      el.style.setProperty("--py", py.toFixed(3));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={ref} className="hero-structure" aria-hidden="true">
      <svg viewBox="0 0 960 600" preserveAspectRatio="xMidYMid slice">
        {/* back layer — the top joist, furthest, faintest, moves least */}
        <g className="hs-layer hs-back">
          <line x1="70" y1="150" x2="890" y2="150" pathLength={1} />
          <circle className="hs-joint" cx="260" cy="150" r="4" style={{ animationDelay: "1.1s" }} />
          <circle className="hs-joint" cx="700" cy="150" r="4" style={{ animationDelay: "1.1s" }} />
        </g>

        {/* mid layer — a post and a joist */}
        <g className="hs-layer hs-mid">
          <line x1="220" y1="480" x2="220" y2="90" pathLength={1} style={{ animationDelay: ".35s" }} />
          <line x1="40" y1="290" x2="920" y2="290" pathLength={1} style={{ animationDelay: ".55s" }} />
          <circle className="hs-joint" cx="220" cy="290" r="4.5" style={{ animationDelay: "1.3s" }} />
          <circle className="hs-joint" cx="220" cy="150" r="4" style={{ animationDelay: "1.3s" }} />
        </g>

        {/* front layer — closest, brightest, moves most: post, joist, bracing */}
        <g className="hs-layer hs-front">
          <line x1="700" y1="480" x2="700" y2="130" pathLength={1} style={{ animationDelay: ".7s" }} />
          <line x1="90" y1="410" x2="850" y2="410" pathLength={1} style={{ animationDelay: ".95s" }} />
          <line x1="220" y1="480" x2="330" y2="380" pathLength={1} style={{ animationDelay: "1.5s" }} />
          <line x1="700" y1="480" x2="590" y2="380" pathLength={1} style={{ animationDelay: "1.5s" }} />
          <circle className="hs-joint" cx="700" cy="410" r="5" style={{ animationDelay: "1.6s" }} />
          <circle className="hs-joint" cx="220" cy="410" r="5" style={{ animationDelay: "1.6s" }} />
        </g>
      </svg>
    </div>
  );
}
