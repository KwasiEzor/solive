"use client";
import { useSetAdminLocale } from "./use-admin-locale";
import type { SiteLocale } from "@/lib/i18n/locale";

export function AdminLangSwitch({
  locale,
  className,
}: {
  locale: SiteLocale;
  className?: string;
}) {
  const { setLocale, pending } = useSetAdminLocale();
  const next: SiteLocale = locale === "en" ? "fr" : "en";
  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      aria-label={locale === "en" ? "Passer en français" : "Switch to English"}
      onClick={() => setLocale(next)}
    >
      {locale === "en" ? "FR" : "EN"}
    </button>
  );
}
