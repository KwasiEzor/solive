"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Mark } from "./icons";

const LINKS: [string, string][] = [
  ["/services", "Services"],
  ["/realisations", "Réalisations"],
  ["/tarifs", "Tarifs"],
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
        <Link href="/" className="brand" aria-label={`${brand}, accueil`}>
          <span className="mark">
            <Mark />
          </span>
          <span>{brand}</span>
        </Link>
        <nav className="nav-links" aria-label="Navigation principale">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/contact" className="btn-sm">
          Parler du projet
        </Link>
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
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link href="/contact" className="btn" onClick={() => setOpen(false)}>
            Parler du projet
          </Link>
        </div>
      )}
    </header>
  );
}
