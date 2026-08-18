"use client";
import { useEffect, useState } from "react";
import { Mark } from "./icons";

const LINKS: [string, string][] = [
  ["#services", "Services"],
  ["#methode", "Méthode"],
  ["#travaux", "Travaux"],
  ["#tarifs", "Tarifs"],
  ["#faq", "Questions"],
];

export function Nav({ brand = "SOLIVE" }: { brand?: string }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const h = () => setSolid(window.scrollY > 40);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className={"nav" + (solid ? " solid" : "")}>
      <div className="wrap nav-in">
        <a href="#top" className="brand" aria-label={`${brand}, accueil`}>
          <span className="mark">
            <Mark />
          </span>
          <span>{brand}</span>
        </a>
        <nav className="nav-links" aria-label="Navigation principale">
          {LINKS.map(([h, l]) => (
            <a key={h} href={h}>
              {l}
            </a>
          ))}
        </nav>
        <a href="#contact" className="btn-sm">
          Parler du projet
        </a>
        <button
          type="button"
          className="burger"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {open && (
        <div className="nav-mob">
          {LINKS.map(([h, l]) => (
            <a key={h} href={h} onClick={() => setOpen(false)}>
              {l}
            </a>
          ))}
          <a href="#contact" className="btn" onClick={() => setOpen(false)}>
            Parler du projet
          </a>
        </div>
      )}
    </header>
  );
}
