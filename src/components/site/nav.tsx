"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/urls";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";
import { LangSwitch } from "./lang-switch";
import { Mark } from "./icons";

const LINK_KEYS = [
  ["/", "home"],
  ["/services", "services"],
  ["/ia", "ia"],
  ["/realisations", "realisations"],
  ["/pourquoi-solive", "pourquoiSolive"],
  ["/tarifs", "tarifs"],
] as const;

export function Nav({ brand = "SOLIVE", locale }: { brand?: string; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const t = getDictionary(locale).nav;

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
        <Link
          href={localizedPath("/", locale)}
          className="brand"
          aria-label={t.brandAria(brand)}
        >
          <span className="mark">
            <Mark />
          </span>
          <span>{brand}</span>
        </Link>
        <nav className="nav-links" aria-label={t.ariaMain}>
          {LINK_KEYS.filter(([href]) => href !== "/").map(([href, key]) => (
            <Link key={href} href={localizedPath(href, locale)}>
              {t.links[key]}
            </Link>
          ))}
        </nav>
        <Link href={localizedPath("/contact", locale)} className="btn-sm">
          {t.cta}
        </Link>
        <LangSwitch locale={locale} className="lang-switch" />
        <button
          type="button"
          className={"burger" + (open ? " open" : "")}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="nav-mobile"
          aria-label={open ? t.ariaMenuClose : t.ariaMenuOpen}
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
            aria-label={t.ariaMenuClose}
            onClick={() => setOpen(false)}
          />
          <div className="nav-mob" id="nav-mobile">
            {LINK_KEYS.map(([href, key]) => (
              <Link
                key={href}
                href={localizedPath(href, locale)}
                onClick={() => setOpen(false)}
              >
                {t.links[key]}
              </Link>
            ))}
            <Link
              href={localizedPath("/contact", locale)}
              className="btn"
              onClick={() => setOpen(false)}
            >
              {t.cta}
            </Link>
            <LangSwitch locale={locale} className="lang-switch mobile" />
          </div>
        </>
      )}
    </header>
  );
}
