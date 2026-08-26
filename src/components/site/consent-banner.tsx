"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/urls";
import { type ConsentValue, getConsent, setConsent } from "@/lib/consent";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";

/**
 * Privacy-first consent banner (SLV-120..123). Shows only when no choice has
 * been made; writes nothing before the user decides. Accessible: labelled
 * region, keyboard-operable, focus moved in on show, reduced-motion safe.
 */
export function ConsentBanner({ locale }: { locale: Locale }) {
  const [show, setShow] = useState(false);
  const t = getDictionary(locale).consentBanner;

  useEffect(() => {
    if (getConsent()) return;
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!show) return null;

  const choose = (v: ConsentValue) => {
    setConsent(v);
    setShow(false);
  };

  return (
    <div
      className="consent"
      role="dialog"
      aria-label={t.ariaLabel}
      aria-describedby="consent-text"
    >
      <div className="consent-in">
        <p id="consent-text">
          <strong>{t.textBold}</strong>
          {t.textRest} <Link href={localizedPath("/cookies", locale)}>{t.learnMore}</Link>.
        </p>
        <div className="consent-actions">
          <button
            type="button"
            className="btn-sm ghost"
            onClick={() => choose("essential")}
          >
            {t.refuse}
          </button>
          <button
            type="button"
            className="btn-sm"
            onClick={() => choose("all")}
          >
            {t.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
