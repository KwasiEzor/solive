"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type ConsentValue, getConsent, setConsent } from "@/lib/consent";

/**
 * Privacy-first consent banner (SLV-120..123). Shows only when no choice has
 * been made; writes nothing before the user decides. Accessible: labelled
 * region, keyboard-operable, focus moved in on show, reduced-motion safe.
 */
export function ConsentBanner() {
  const [show, setShow] = useState(false);

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
      aria-label="Consentement aux cookies"
      aria-describedby="consent-text"
    >
      <div className="consent-in">
        <p id="consent-text">
          <strong>On respecte votre vie privée.</strong> Ce site ne dépose aucun
          cookie de suivi. On aimerait, à terme, mesurer l’audience de façon
          anonyme et proposer un assistant — uniquement avec votre accord.{" "}
          <Link href="/cookies">En savoir plus</Link>.
        </p>
        <div className="consent-actions">
          <button
            type="button"
            className="btn-sm ghost"
            onClick={() => choose("essential")}
          >
            Refuser le non-essentiel
          </button>
          <button
            type="button"
            className="btn-sm"
            onClick={() => choose("all")}
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
