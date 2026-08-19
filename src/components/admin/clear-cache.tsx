"use client";
import { useState } from "react";

/** Clears the local PWA cache, offline queue and service worker (SLV-087). */
export function ClearCacheButton() {
  const [state, setState] = useState<"idle" | "done">("idle");

  async function clear() {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      indexedDB.deleteDatabase("solive-offline");
    } finally {
      setState("done");
    }
  }

  return (
    <button
      type="button"
      onClick={clear}
      className="self-start rounded border border-[var(--line)] px-3 py-1.5 text-sm hover:border-acc"
    >
      {state === "done" ? "Cache local vidé ✓" : "Vider le cache local"}
    </button>
  );
}
