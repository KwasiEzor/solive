import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge, type BadgeTone, PageHeader } from "@/components/admin/ui";
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
const TONE: Record<string, BadgeTone> = {
  create: "green",
  publish: "green",
  restore: "green",
  update: "blue",
  reorder: "blue",
  login: "neutral",
  invite: "amber",
  unpublish: "amber",
  role_change: "amber",
  delete: "red",
};

// Owner-only (SLV-069).
export default async function JournalPage() {
  const admin = await getCurrentAdmin();
  if (!admin.ok) redirect("/connexion");
  if (admin.value.role !== "owner") redirect("/admin");

  const entries = await getAuditLog(200);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Journal d’audit"
        description="Traçabilité des actions d’administration (200 dernières)."
      />
      <div className="adm-card overflow-x-auto">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Quand</th>
              <th>Action</th>
              <th>Entité</th>
              <th>Diff</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((a) => (
              <tr key={a.id} className="align-top">
                <td className="whitespace-nowrap text-[var(--dim)]">
                  {new Date(a.createdAt).toLocaleString("fr-BE", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td>
                  <Badge tone={TONE[a.action] ?? "neutral"}>
                    {ACTION_LABEL[a.action] ?? a.action}
                  </Badge>
                </td>
                <td>
                  {a.entityType}
                  {a.entityId ? (
                    <span className="text-[var(--dim)]">
                      {" · "}
                      {a.entityId.slice(0, 8)}
                    </span>
                  ) : (
                    ""
                  )}
                </td>
                <td className="max-w-md truncate font-mono text-xs text-[var(--dim)]">
                  {a.diff ? JSON.stringify(a.diff) : "—"}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="text-[var(--dim)]">
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
