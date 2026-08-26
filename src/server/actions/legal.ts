"use server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { err, ok, type Result } from "@/lib/result";
import { env } from "@/lib/env";
import { requireAdmin } from "@/server/auth/guards";
import { getDb } from "@/server/db";
import { writeAudit } from "@/server/services/audit";
import { legalPages } from "../../../drizzle/schema";

export interface SaveLegalPageInput {
  id: string;
  body: unknown; // Tiptap JSON
  expectedUpdatedAt: string; // optimistic lock, same pattern as saveSectionAction
}

export type LegalPageResult = Result<
  { updatedAt: string },
  "unauthorized" | "not_found" | "conflict"
>;

export async function saveLegalPageAction(
  input: SaveLegalPageInput,
): Promise<LegalPageResult> {
  const admin = await requireAdmin();
  const db = getDb();
  const [current] = await db
    .select()
    .from(legalPages)
    .where(eq(legalPages.id, input.id))
    .limit(1);
  if (!current) return err("not_found");
  if (current.updatedAt.toISOString() !== input.expectedUpdatedAt) {
    return err("conflict");
  }

  const [updated] = await db
    .update(legalPages)
    .set({ body: input.body as never, updatedAt: new Date() })
    .where(eq(legalPages.id, input.id))
    .returning();

  await writeAudit({
    actorId: admin.userId,
    action: "update",
    entityType: "legal_page",
    entityId: input.id,
    ipHash: hashIp(
      clientIpFromHeaders(await headers()) ?? "unknown",
      env.IP_HASH_SALT ?? "dev-insecure-salt",
    ),
    diff: { slug: current.slug, locale: current.locale },
  });

  revalidatePath("/confidentialite");
  revalidatePath("/en/confidentialite");
  return ok({ updatedAt: updated!.updatedAt.toISOString() });
}
