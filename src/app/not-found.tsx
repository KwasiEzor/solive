import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";

/**
 * Root 404 — fires for any URL that matches no route at all (an entirely
 * unmatched path never enters a route group's segment tree, so a nested
 * (public)/not-found.tsx never runs for it; only the root one does). No
 * Nav/Footer here (same constraint as error.tsx: this must stay
 * dependency-light, it can't assume the rest of the chrome renders cleanly)
 * — (public)/not-found.tsx stays for an explicit notFound() called from
 * inside a public page (e.g. an invalid dynamic slug), which does get the
 * full site chrome.
 */
export default async function RootNotFound() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).notFound;

  return (
    <div
      className="t-ardoise"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        textAlign: "center",
        padding: "40px 24px",
        background: "var(--bg)",
        color: "var(--fg)",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "12px",
          letterSpacing: "0.1em",
          opacity: 0.6,
        }}
      >
        {t.kicker}
      </span>
      <h1 style={{ fontSize: "22px", fontWeight: 800 }}>{t.title}</h1>
      <p style={{ opacity: 0.7, maxWidth: "32em" }}>{t.lede}</p>
      <Link
        href={localizedPath("/", locale)}
        style={{
          padding: "10px 18px",
          borderRadius: "8px",
          border: "1px solid currentColor",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        {t.cta}
      </Link>
    </div>
  );
}
