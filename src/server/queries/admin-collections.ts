import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { column, type CollectionConfig } from "@/server/admin/collections";
import { getDb } from "@/server/db";

type Row = Record<string, unknown>;

/** All non-deleted rows (drafts included) for the admin list, ordered. */
export async function listItems(cfg: CollectionConfig): Promise<Row[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(cfg.table)
    .where(isNull(column(cfg, "deletedAt")))
    .orderBy(asc(column(cfg, "sortOrder")));
  return rows as Row[];
}

export async function getItem(
  cfg: CollectionConfig,
  id: string,
): Promise<Row | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(cfg.table)
    .where(and(eq(column(cfg, "id"), id), isNull(column(cfg, "deletedAt"))))
    .limit(1);
  return (rows[0] as Row) ?? null;
}
