"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { SiteLocale } from "@/lib/i18n/locale";

/**
 * Root error boundary (SLV — replaces Next's default crash screen). Must be
 * a Client Component (Next requirement) and sits above every route group, so
 * it has no server-resolved locale to read — falls back to the <html lang>
 * the root layout already set server-side, rather than defaulting silently
 * to French for English visitors.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  // Lazy initializer (not an effect + setState): reads the <html lang> the
  // root layout already resolved server-side, so this only needs to run once.
  const [locale] = useState<SiteLocale>(() =>
    typeof document !== "undefined" && document.documentElement.lang === "en"
      ? "en"
      : "fr",
  );

  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = getDictionary(locale).errorPage;

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        textAlign: "center",
        padding: "40px 24px",
      }}
    >
      <h1 style={{ fontSize: "22px", fontWeight: 800 }}>{t.title}</h1>
      <p style={{ opacity: 0.7, maxWidth: "32em" }}>{t.lede}</p>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid currentColor",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          {t.retry}
        </button>
        <Link
          href="/"
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid currentColor",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {t.home}
        </Link>
      </div>
    </div>
  );
}
