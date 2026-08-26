"use client";
import { useEffect, useRef, useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";

const bar = {
  position: "fixed" as const,
  right: "16px",
  bottom: "16px",
  zIndex: 80,
  maxWidth: "min(92vw, 380px)",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid color-mix(in srgb, var(--acc) 40%, var(--line))",
  background: "var(--bg2)",
  boxShadow: "var(--glow)",
  fontSize: "13px",
};

/**
 * Detects a waiting service worker and offers an explicit reload — never an
 * automatic skipWaiting that swaps content under the user (SLV-086).
 */
export function SwUpdatePrompt({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).swUpdate;
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const accepted = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistration().then((r) => {
      if (!r) return;
      if (r.waiting) setWaiting(r.waiting);
      r.addEventListener("updatefound", () => {
        const installing = r.installing;
        installing?.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(installing);
          }
        });
      });
    });

    // Reload only after the user accepts an update — never on the first-load
    // clientsClaim, which would reload the page under the visitor (SLV-086).
    let reloaded = false;
    const onControllerChange = () => {
      if (!accepted.current || reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () =>
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
  }, []);

  if (!waiting || dismissed) return null;

  return (
    <div role="alert" style={bar}>
      <span>{t.available}</span>
      <button
        type="button"
        onClick={() => {
          accepted.current = true;
          waiting.postMessage({ type: "SKIP_WAITING" });
        }}
        style={{
          background: "linear-gradient(180deg, var(--acc), var(--acc-strong))",
          color: "var(--on-acc)",
          padding: "6px 12px",
          borderRadius: "8px",
          fontWeight: 600,
        }}
      >
        {t.reload}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t.later}
        title={t.later}
        style={{
          background: "none",
          border: 0,
          color: "var(--fg)",
          opacity: 0.6,
          cursor: "pointer",
          fontSize: "18px",
          lineHeight: 1,
          padding: "2px 4px",
        }}
      >
        ×
      </button>
    </div>
  );
}
