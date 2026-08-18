"use server";
import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { updateTag } from "next/cache";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { err, ok, type Result } from "@/lib/result";
import { env } from "@/lib/env";
import { requireAdmin } from "@/server/auth/guards";
import { getDb } from "@/server/db";
import { writeAudit, type AuditAction } from "@/server/services/audit";
import { contentRevisions, sections } from "../../../drizzle/schema";

const KEEP_REVISIONS = 30;

async function ipHash(): Promise<string> {
  return hashIp(
    clientIpFromHeaders(await headers()) ?? "unknown",
    env.IP_HASH_SALT ?? "dev-insecure-salt",
  );
}

/** Snapshot the current row, then prune to the last 30 (SLV-028/063). */
async function snapshot(
  entityId: string,
  authorId: string,
  current: unknown,
) {
  const db = getDb();
  await db.insert(contentRevisions).values({
    entityType: "section",
    entityId,
    snapshot: current as never,
    authorId,
  });
  await db.execute(sql`
    delete from ${contentRevisions}
    where ${contentRevisions.entityType} = 'section'
      and ${contentRevisions.entityId} = ${entityId}
      and ${contentRevisions.id} not in (
        select id from ${contentRevisions}
        where ${contentRevisions.entityType} = 'section'
          and ${contentRevisions.entityId} = ${entityId}
        order by ${contentRevisions.createdAt} desc
        limit ${KEEP_REVISIONS}
      )
  `);
}

export interface SaveSectionInput {
  id: string;
  heading: string;
  kicker: string;
  body: unknown; // Tiptap JSON
  expectedUpdatedAt: string; // optimistic lock (SLV-073)
}

export type SectionResult = Result<
  { updatedAt: string },
  "unauthorized" | "not_found" | "conflict"
>;

async function loadSection(id: string) {
  const db = getDb();
  const rows = await db.select().from(sections).where(eq(sections.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Autosave / manual save of a draft. Does NOT revalidate public (SLV-071). */
export async function saveSectionAction(
  input: SaveSectionInput,
): Promise<SectionResult> {
  const admin = await requireAdmin();
  const current = await loadSection(input.id);
  if (!current) return err("not_found");
  // Optimistic lock: refuse silent overwrite (SLV-073).
  if (current.updatedAt.toISOString() !== input.expectedUpdatedAt) {
    return err("conflict");
  }

  await snapshot(input.id, admin.userId, current);
  const db = getDb();
  const [updated] = await db
    .update(sections)
    .set({
      heading: input.heading,
      kicker: input.kicker,
      body: input.body as never,
      updatedAt: new Date(),
    })
    .where(eq(sections.id, input.id))
    .returning();

  await writeAudit({
    actorId: admin.userId,
    action: "update",
    entityType: "section",
    entityId: input.id,
    ipHash: await ipHash(),
    diff: { key: current.key },
  });
  return ok({ updatedAt: updated!.updatedAt.toISOString() });
}

async function setStatus(
  id: string,
  status: "draft" | "published",
  action: AuditAction,
): Promise<SectionResult> {
  const admin = await requireAdmin();
  const current = await loadSection(id);
  if (!current) return err("not_found");

  await snapshot(id, admin.userId, current);
  const db = getDb();
  const [updated] = await db
    .update(sections)
    .set({
      status,
      publishedAt: status === "published" ? new Date() : current.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(sections.id, id))
    .returning();

  await writeAudit({
    actorId: admin.userId,
    action,
    entityType: "section",
    entityId: id,
    ipHash: await ipHash(),
    diff: { status },
  });
  // Publishing/unpublishing changes public output → targeted invalidation only.
  updateTag("content:sections");
  return ok({ updatedAt: updated!.updatedAt.toISOString() });
}

export async function publishSectionAction(id: string) {
  return setStatus(id, "published", "publish");
}
export async function unpublishSectionAction(id: string) {
  return setStatus(id, "draft", "unpublish");
}

/** Restore a past revision as the current draft (SLV-063). */
export async function restoreSectionRevisionAction(input: {
  sectionId: string;
  revisionId: string;
}): Promise<SectionResult> {
  const admin = await requireAdmin();
  const db = getDb();
  const [rev] = await db
    .select()
    .from(contentRevisions)
    .where(
      and(
        eq(contentRevisions.id, input.revisionId),
        eq(contentRevisions.entityId, input.sectionId),
      ),
    )
    .limit(1);
  if (!rev) return err("not_found");

  const snap = rev.snapshot as { heading?: string; kicker?: string; body?: unknown };
  const current = await loadSection(input.sectionId);
  if (!current) return err("not_found");
  await snapshot(input.sectionId, admin.userId, current);

  const [updated] = await db
    .update(sections)
    .set({
      heading: snap.heading ?? null,
      kicker: snap.kicker ?? null,
      body: (snap.body ?? null) as never,
      updatedAt: new Date(),
    })
    .where(eq(sections.id, input.sectionId))
    .returning();

  await writeAudit({
    actorId: admin.userId,
    action: "restore",
    entityType: "section",
    entityId: input.sectionId,
    ipHash: await ipHash(),
    diff: { revisionId: input.revisionId },
  });
  return ok({ updatedAt: updated!.updatedAt.toISOString() });
}
