import "server-only";
import { headers } from "next/headers";

/** Locales the public site actually serves — see src/proxy.ts's /en rewrite. */
export const SUPPORTED_LOCALES = ["fr", "en"] as const;
export type SiteLocale = (typeof SUPPORTED_LOCALES)[number];

/** Resolved from the x-solive-locale header proxy.ts sets on every request. */
export async function getRequestLocale(): Promise<SiteLocale> {
  const h = await headers();
  return h.get("x-solive-locale") === "en" ? "en" : "fr";
}
