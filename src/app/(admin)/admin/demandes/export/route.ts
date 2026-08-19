import { getCurrentAdmin } from "@/server/auth/guards";
import { getLeads } from "@/server/queries/admin";

// CSV export of leads (SLV-066). Admin-only; served as a download.
function csvCell(value: unknown): string {
  const s =
    value == null
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin.ok) return new Response("Unauthorized", { status: 401 });

  const rows = await getLeads();
  const headers = [
    "created_at",
    "name",
    "email",
    "company",
    "status",
    "project_types",
    "budget_range",
    "message",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((l) =>
      [
        l.createdAt.toISOString(),
        l.name,
        l.email,
        l.company,
        l.status,
        l.projectTypes,
        l.budgetRange,
        l.message,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];

  return new Response(`﻿${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="solive-demandes-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
