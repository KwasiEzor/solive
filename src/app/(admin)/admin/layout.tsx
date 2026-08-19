import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/server/actions/auth";
import { getCurrentAdmin } from "@/server/auth/guards";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";

/**
 * Admin guard (SLV-050) — server-side, on every request. Never trusts client
 * state; Server Actions re-check independently. Enforces the MFA enrollment
 * gate (SLV-041): an owner without MFA can only reach /mfa.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const result = await getCurrentAdmin();
  if (!result.ok) redirect("/connexion");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("admin_users")
    .select("mfa_enrolled_at, role")
    .eq("id", result.value.userId)
    .maybeSingle();
  if (data && data.role === "owner" && !data.mfa_enrolled_at) {
    redirect("/mfa");
  }

  const nav = [
    ["/admin", "Tableau de bord"],
    ["/admin/contenu/hero", "Contenu"],
    ["/admin/travaux", "Travaux"],
    ["/admin/medias", "Médias"],
    ["/admin/demandes", "Demandes"],
    ["/admin/parametres", "Paramètres"],
    ["/admin/utilisateurs", "Utilisateurs"],
    ["/admin/journal", "Journal"],
  ] as const;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col gap-1 border-r border-[var(--line)] bg-[var(--bg2)] p-4">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[var(--dim)]">
          Solive admin
        </p>
        <nav className="flex flex-col gap-0.5" aria-label="Navigation admin">
          {nav.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded px-2 py-1.5 text-sm hover:bg-[var(--bg3)]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <form action={signOutAction} className="mt-auto">
          <button
            type="submit"
            className="w-full rounded border border-[var(--line)] px-2 py-1.5 text-left text-sm hover:border-acc"
          >
            Déconnexion
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
