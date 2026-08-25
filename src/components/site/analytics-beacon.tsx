"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getConsent } from "@/lib/consent";

/**
 * Cookieless, anonymous page-view beacon (SLV-140). Sends no personal data and
 * sets no storage. Skips visitors who opted out ("Refuser le non-essentiel")
 * or who signal Do-Not-Track / Global Privacy Control.
 */
export function AnalyticsBeacon() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === last.current) return;
    last.current = pathname;

    // Honour explicit opt-out and browser privacy signals.
    if (getConsent() === "essential") return;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;

    const q = new URLSearchParams(window.location.search);
    const w = window.innerWidth;
    const payload = {
      path: pathname,
      ref: document.referrer || undefined,
      utm: {
        source: q.get("utm_source") ?? undefined,
        medium: q.get("utm_medium") ?? undefined,
        campaign: q.get("utm_campaign") ?? undefined,
      },
      screen: w < 768 ? "m" : w < 1024 ? "t" : "d",
    };

    void fetch("/api/collect", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
