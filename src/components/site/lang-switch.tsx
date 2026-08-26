"use client";
import { usePathname } from "next/navigation";
import { localizedPath } from "@/lib/i18n/urls";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";

/**
 * FR/EN toggle: swaps the /en prefix on the CURRENT path (slug included).
 * Deliberately a plain <a>, not next/link: `/` and `/en` rewrite to the same
 * underlying route in proxy.ts, so Next's client Router Cache treats them as
 * the same page and a soft navigation between them silently keeps the old
 * locale's content on screen. A real navigation always re-resolves correctly.
 */
export function LangSwitch({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const pathname = usePathname();
  const target = localizedPath(pathname, locale === "en" ? "fr" : "en");
  return (
    <a
      href={target}
      hrefLang={locale === "en" ? "fr" : "en"}
      className={className}
      aria-label={locale === "en" ? "Passer en français" : "Switch to English"}
    >
      {locale === "en" ? "FR" : "EN"}
    </a>
  );
}
