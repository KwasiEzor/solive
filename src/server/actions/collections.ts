"use server";
import { and, asc, desc, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { err, ok, type Result } from "@/lib/result";
import {
  type CollectionConfig,
  column,
  getCollection,
} from "@/server/admin/collections";
import { requireAdmin } from "@/server/auth/guards";
import { getDb } from "@/server/db";
import { writeAudit } from "@/server/services/audit";

type Values = Record<string, string>;
type CrudError =
  | "unauthorized"
  | "not_found"
  | "conflict"
  | "invalid"
  | "invalid_collection";

async function ipHash(): Promise<string> {
  return hashIp(
    clientIpFromHeaders(await headers()) ?? "unknown",
    env.IP_HASH_SALT ?? "dev-insecure-salt",
  );
}

/** Form strings → typed DB values, per the collection's field descriptors. */
function coerce(cfg: CollectionConfig, raw: Values): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of cfg.fields) {
    const v = (raw[f.name] ?? "").toString();
    switch (f.type) {
      case "text":
      case "textarea":
      case "json": // stored as a JSON string value in a jsonb column
        out[f.name] = v.trim() === "" ? null : v;
        break;
      case "list":
        out[f.name] = v
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case "number": {
        const n = Number(v);
        out[f.name] = v.trim() === "" || Number.isNaN(n) ? null : n;
        break;
      }
      case "boolean":
        out[f.name] = v === "1" || v === "on" || v === "true";
        break;
    }
  }
  return out;
}

function missingRequired(cfg: CollectionConfig, values: Record<string, unknown>) {
  return cfg.fields.some((f) => f.required && !values[f.name]);
}

export async function createItem(
  collectionKey: string,
  raw: Values,
): Promise<Result<{ id: string }, CrudError>> {
  const cfg = getCollection(collectionKey);
  if (!cfg) return err("invalid_collection");
  const admin = await requireAdmin();
  const values = coerce(cfg, raw);
  if (missingRequired(cfg, values)) return err("invalid");

  const db = getDb();
  const rows = await db
    .select({
      max: sql<number>`coalesce(max(${column(cfg, "sortOrder")}), -1)`,
    })
    .from(cfg.table);
  const nextOrder = (rows[0]?.max ?? -1) + 1;

  const inserted = await db
    .insert(cfg.table)
    .values({ ...values, sortOrder: nextOrder } as never)
    .returning({ id: column(cfg, "id") });
  const id = (inserted[0] as { id: string }).id;

  await writeAudit({
    actorId: admin.userId,
    action: "create",
    entityType: cfg.key,
    entityId: id,
    ipHash: await ipHash(),
  });
  return ok({ id });
}

export async function updateItem(
  collectionKey: string,
  id: string,
  raw: Values,
  expectedUpdatedAt: string,
): Promise<Result<{ updatedAt: string }, CrudError>> {
  const cfg = getCollection(collectionKey);
  if (!cfg) return err("invalid_collection");
  const admin = await requireAdmin();
  const values = coerce(cfg, raw);
  if (missingRequired(cfg, values)) return err("invalid");

  const db = getDb();
  const currentRows = await db
    .select()
    .from(cfg.table)
    .where(eq(column(cfg, "id"), id))
    .limit(1);
  const current = currentRows[0] as Record<string, unknown> | undefined;
  if (!current) return err("not_found");
  if ((current.updatedAt as Date).toISOString() !== expectedUpdatedAt) {
    return err("conflict");
  }

  const updated = await db
    .update(cfg.table)
    .set(values as never)
    .where(eq(column(cfg, "id"), id))
    .returning();
  const newUpdatedAt = (
    updated[0] as { updatedAt: Date }
  ).updatedAt.toISOString();

  await writeAudit({
    actorId: admin.userId,
    action: "update",
    entityType: cfg.key,
    entityId: id,
    ipHash: await ipHash(),
  });
  if (current.status === "published") updateTag(cfg.contentTag);
  return ok({ updatedAt: newUpdatedAt });
}

export async function deleteItem(
  collectionKey: string,
  id: string,
): Promise<Result<null, CrudError>> {
  const cfg = getCollection(collectionKey);
  if (!cfg) return err("invalid_collection");
  const admin = await requireAdmin();
  const db = getDb();
  const rows = await db
    .update(cfg.table)
    .set({ deletedAt: new Date() } as never)
    .where(and(eq(column(cfg, "id"), id), isNull(column(cfg, "deletedAt"))))
    .returning();
  if (rows.length === 0) return err("not_found");

  await writeAudit({
    actorId: admin.userId,
    action: "delete",
    entityType: cfg.key,
    entityId: id,
    ipHash: await ipHash(),
  });
  // updateTag (not revalidateTag): the admin must see their own change
  // immediately, not after a stale-while-revalidate window.
  updateTag(cfg.contentTag);
  return ok(null);
}

export async function togglePublishItem(
  collectionKey: string,
  id: string,
  publish: boolean,
): Promise<Result<null, CrudError>> {
  const cfg = getCollection(collectionKey);
  if (!cfg) return err("invalid_collection");
  const admin = await requireAdmin();
  const db = getDb();
  const rows = await db
    .update(cfg.table)
    .set({
      status: publish ? "published" : "draft",
      ...(publish ? { publishedAt: new Date() } : {}),
    } as never)
    .where(and(eq(column(cfg, "id"), id), isNull(column(cfg, "deletedAt"))))
    .returning();
  if (rows.length === 0) return err("not_found");

  await writeAudit({
    actorId: admin.userId,
    action: publish ? "publish" : "unpublish",
    entityType: cfg.key,
    entityId: id,
    ipHash: await ipHash(),
  });
  // updateTag (not revalidateTag): the admin must see their own change
  // immediately, not after a stale-while-revalidate window.
  updateTag(cfg.contentTag);
  return ok(null);
}

/** Swap sort order with the adjacent non-deleted row (keyboard-safe reorder). */
export async function reorderItem(
  collectionKey: string,
  id: string,
  direction: "up" | "down",
): Promise<Result<null, CrudError>> {
  const cfg = getCollection(collectionKey);
  if (!cfg) return err("invalid_collection");
  const admin = await requireAdmin();
  const db = getDb();
  const sortCol = column(cfg, "sortOrder");
  const idCol = column(cfg, "id");
  const delCol = column(cfg, "deletedAt");

  const currentRows = await db
    .select()
    .from(cfg.table)
    .where(eq(idCol, id))
    .limit(1);
  const current = currentRows[0] as Record<string, unknown> | undefined;
  if (!current) return err("not_found");
  const order = current.sortOrder as number;

  const neighborRows = await db
    .select()
    .from(cfg.table)
    .where(
      and(
        isNull(delCol),
        direction === "up" ? lt(sortCol, order) : gt(sortCol, order),
      ),
    )
    .orderBy(direction === "up" ? desc(sortCol) : asc(sortCol))
    .limit(1);
  const neighbor = neighborRows[0] as Record<string, unknown> | undefined;
  if (!neighbor) return ok(null); // already at the edge

  await db
    .update(cfg.table)
    .set({ sortOrder: neighbor.sortOrder as number } as never)
    .where(eq(idCol, id));
  await db
    .update(cfg.table)
    .set({ sortOrder: order } as never)
    .where(eq(idCol, neighbor.id as string));

  await writeAudit({
    actorId: admin.userId,
    action: "reorder",
    entityType: cfg.key,
    entityId: id,
    ipHash: await ipHash(),
  });
  // updateTag (not revalidateTag): the admin must see their own change
  // immediately, not after a stale-while-revalidate window.
  updateTag(cfg.contentTag);
  return ok(null);
}
