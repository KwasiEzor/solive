"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Mark } from "./icons";

const LINKS: [string, string][] = [
  ["/", "Accueil"],
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

  // Close on Escape; lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

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
          {LINKS.filter(([href]) => href !== "/").map(([href, label]) => (
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
          className={"burger" + (open ? " open" : "")}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="nav-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {open && (
        <>
          <button
            type="button"
            className="nav-scrim"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <div className="nav-mob" id="nav-mobile">
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href="/contact" className="btn" onClick={() => setOpen(false)}>
              Parler du projet
            </Link>
          </div>
        </>
      )}
    </header>
  );
}
