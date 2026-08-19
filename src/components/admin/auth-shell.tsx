import Link from "next/link";
import type { ReactNode } from "react";
import { Mark, Tick } from "@/components/site/icons";

const TRUST = [
  "Connexion chiffrée de bout en bout (TLS)",
  "Double authentification TOTP obligatoire",
  "Sessions listées et révocables à tout moment",
  "Mots de passe vérifiés contre les fuites connues",
];

/** Premium split-screen shell for the auth pages (SLV-040 trust). */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]"
      style={{ background: "var(--bg)", color: "var(--fg)" }}
    >
      {/* Brand + trust panel */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{
          background: "var(--bg2)",
          backgroundImage: "var(--grad-hero)",
          borderRight: "1px solid var(--line)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-extrabold tracking-[0.16em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span style={{ color: "var(--acc)" }}>
            <Mark size={20} />
          </span>
          SOLIVE
        </Link>

        <div className="flex max-w-md flex-col gap-6">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.14em]"
            style={{ color: "var(--acc)" }}
          >
            Espace d’administration
          </p>
          <h2
            className="text-3xl font-extrabold leading-tight"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
          >
            Un accès protégé, digne de vos projets clients.
          </h2>
          <ul className="flex flex-col gap-3 text-sm" style={{ color: "var(--dim)" }}>
            {TRUST.map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5" style={{ color: "var(--acc)" }}>
                  <Tick />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="font-mono text-[11px]" style={{ color: "var(--dim2)" }}>
          Solive · studio de développement · Bruxelles
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-sm flex-col gap-7">
          <Link
            href="/"
            className="flex items-center gap-2 font-extrabold tracking-[0.16em] lg:hidden"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span style={{ color: "var(--acc)" }}>
              <Mark size={18} />
            </span>
            SOLIVE
          </Link>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm" style={{ color: "var(--dim)" }}>
                {subtitle}
              </p>
            )}
          </div>
          {children}
          <Link
            href="/"
            className="text-xs underline underline-offset-2"
            style={{ color: "var(--dim2)" }}
          >
            ← Retour au site
          </Link>
        </div>
      </main>
    </div>
  );
}
