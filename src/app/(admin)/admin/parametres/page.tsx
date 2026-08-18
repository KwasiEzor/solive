import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  revokeOtherSessionsAction,
  revokeSessionAction,
} from "@/server/actions/sessions";
import { getCurrentAdmin } from "@/server/auth/guards";
import { listUserSessions } from "@/server/services/sessions";

export const instant = false;

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false, follow: false },
};

function fmt(ts: string | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("fr-BE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function SettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin.ok) redirect("/connexion");
  const sessions = await listUserSessions(admin.value.userId);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Paramètres</h1>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Sessions actives</h2>
          <form action={revokeOtherSessionsAction}>
            <button
              type="submit"
              className="rounded border border-[var(--line)] px-3 py-1.5 text-sm hover:border-acc"
            >
              Révoquer les autres sessions
            </button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-[var(--dim)]">
                <th className="py-2 pr-4 font-medium">Appareil</th>
                <th className="py-2 pr-4 font-medium">IP</th>
                <th className="py-2 pr-4 font-medium">Dernière activité</th>
                <th className="py-2 pr-4 font-medium">Niveau</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-[var(--line2)]">
                  <td className="max-w-xs truncate py-2 pr-4">
                    {s.userAgent ?? "Inconnu"}
                  </td>
                  <td className="py-2 pr-4">{s.ip ?? "—"}</td>
                  <td className="py-2 pr-4">{fmt(s.updatedAt ?? s.createdAt)}</td>
                  <td className="py-2 pr-4">{s.aal ?? "—"}</td>
                  <td className="py-2">
                    <form action={revokeSessionAction}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <button
                        type="submit"
                        className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:border-red-500"
                      >
                        Révoquer
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-[var(--dim)]">
                    Aucune session listée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
