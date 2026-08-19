import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/server/auth/guards";
import { getAuditLog } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "Journal d’audit",
  robots: { index: false, follow: false },
};

const ACTION_LABEL: Record<string, string> = {
  create: "création",
  update: "modification",
  delete: "suppression",
  publish: "publication",
  unpublish: "dépublication",
  restore: "restauration",
  login: "connexion",
  invite: "invitation",
  role_change: "rôle",
  reorder: "réordre",
};

// Owner-only (SLV-069).
export default async function JournalPage() {
  const admin = await getCurrentAdmin();
  if (!admin.ok) redirect("/connexion");
  if (admin.value.role !== "owner") redirect("/admin");

  const entries = await getAuditLog(200);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Journal d’audit</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-[var(--dim)]">
              <th className="py-2 pr-4 font-medium">Quand</th>
              <th className="py-2 pr-4 font-medium">Action</th>
              <th className="py-2 pr-4 font-medium">Entité</th>
              <th className="py-2 font-medium">Diff</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((a) => (
              <tr key={a.id} className="border-b border-[var(--line2)] align-top">
                <td className="whitespace-nowrap py-2 pr-4 text-[var(--dim)]">
                  {new Date(a.createdAt).toLocaleString("fr-BE", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="py-2 pr-4">{ACTION_LABEL[a.action] ?? a.action}</td>
                <td className="py-2 pr-4">
                  {a.entityType}
                  {a.entityId ? ` · ${a.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="py-2 font-mono text-xs text-[var(--dim)]">
                  {a.diff ? JSON.stringify(a.diff) : "—"}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-[var(--dim)]">
                  Aucune entrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
