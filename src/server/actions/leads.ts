"use server";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { env } from "@/lib/env";
import { err, ok, type Result } from "@/lib/result";
import { requireAdmin } from "@/server/auth/guards";
import { getDb } from "@/server/db";
import { writeAudit } from "@/server/services/audit";
import { leadEvents, leads } from "../../../drizzle/schema";

const STATUSES = ["new", "contacted", "quoted", "won", "lost"] as const;
type LeadStatus = (typeof STATUSES)[number];

async function ipHash() {
  return hashIp(
    clientIpFromHeaders(await headers()) ?? "unknown",
    env.IP_HASH_SALT ?? "dev-insecure-salt",
  );
}

export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUSES.includes(status as LeadStatus)) return;

  const db = getDb();
  const [current] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!current) return;

  await db
    .update(leads)
    .set({ status: status as LeadStatus })
    .where(eq(leads.id, id));
  await db.insert(leadEvents).values({
    leadId: id,
    type: "status_change",
    payload: { from: current.status, to: status },
    actorId: admin.userId,
  });
  await writeAudit({
    actorId: admin.userId,
    action: "update",
    entityType: "lead",
    entityId: id,
    ipHash: await ipHash(),
    diff: { status: { from: current.status, to: status } },
  });
  revalidatePath(`/admin/demandes/${id}`);
  revalidatePath("/admin/demandes");
}

export async function addLeadNoteAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("leadId") ?? "");
  const text = String(formData.get("note") ?? "").trim();
  if (!id || !text) return;

  const db = getDb();
  await db.insert(leadEvents).values({
    leadId: id,
    type: "note",
    payload: { text },
    actorId: admin.userId,
  });
  await writeAudit({
    actorId: admin.userId,
    action: "update",
    entityType: "lead",
    entityId: id,
    ipHash: await ipHash(),
    diff: { note: true },
  });
  revalidatePath(`/admin/demandes/${id}`);
}

/**
 * Hard delete — `leads` carries no soft-delete column (unlike sections/
 * collections). `lead_events` cascades (schema FK onDelete:"cascade");
 * `quotes.leadId` is onDelete:"set null" so any quote already generated from
 * this lead survives with its own snapshot (clientName/clientEmail), just
 * loses the back-reference.
 */
export async function deleteLeadAction(id: string): Promise<Result<null, "not_found">> {
  const admin = await requireAdmin();
  const db = getDb();
  const [deleted] = await db
    .delete(leads)
    .where(eq(leads.id, id))
    .returning({ id: leads.id, name: leads.name, email: leads.email });
  if (!deleted) return err("not_found");

  await writeAudit({
    actorId: admin.userId,
    action: "delete",
    entityType: "lead",
    entityId: deleted.id,
    diff: { name: deleted.name, email: deleted.email },
    ipHash: await ipHash(),
  });
  revalidatePath("/admin/demandes");
  return ok(null);
}

export async function bulkDeleteLeadsAction(
  ids: string[],
): Promise<Result<{ count: number }, "invalid">> {
  if (ids.length === 0) return err("invalid");
  const admin = await requireAdmin();
  const db = getDb();
  const deleted = await db
    .delete(leads)
    .where(inArray(leads.id, ids))
    .returning({ id: leads.id, name: leads.name, email: leads.email });
  if (deleted.length === 0) return err("invalid");

  const hash = await ipHash();
  await Promise.all(
    deleted.map((d) =>
      writeAudit({
        actorId: admin.userId,
        action: "delete",
        entityType: "lead",
        entityId: d.id,
        diff: { name: d.name, email: d.email },
        ipHash: hash,
      }),
    ),
  );
  revalidatePath("/admin/demandes");
  return ok({ count: deleted.length });
}
