"use client";
import { useEffect, useRef, useState } from "react";

const bar = {
  position: "fixed" as const,
  right: "16px",
  bottom: "16px",
  zIndex: 80,
  display: "flex",
  alignItems: "center",
  gap: "12px",
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
export function SwUpdatePrompt() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
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

  if (!waiting) return null;

  return (
    <div role="alert" style={bar}>
      <span>Une nouvelle version est disponible.</span>
      <button
        type="button"
        onClick={() => {
          accepted.current = true;
          waiting.postMessage({ type: "SKIP_WAITING" });
        }}
        className="rounded"
        style={{
          background: "linear-gradient(180deg, var(--acc), var(--acc-strong))",
          color: "var(--on-acc)",
          padding: "6px 12px",
          borderRadius: "8px",
          fontWeight: 600,
        }}
      >
        Recharger
      </button>
    </div>
  );
}
