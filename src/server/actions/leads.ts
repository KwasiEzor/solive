"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { env } from "@/lib/env";
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
