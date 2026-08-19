"use server";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { env } from "@/lib/env";
import { requireOwner } from "@/server/auth/guards";
import { getDb } from "@/server/db";
import { writeAudit } from "@/server/services/audit";
import { siteSettings } from "../../../drizzle/schema";

const PALETTES = ["chaux", "ardoise", "cobalt"] as const;
type Palette = (typeof PALETTES)[number];

/**
 * Change the active palette (SLV-067). Owner-only (SLV-038). Applied to the
 * public site without redeploy via targeted revalidation.
 */
export async function updatePaletteAction(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  const palette = String(formData.get("palette") ?? "");
  if (!PALETTES.includes(palette as Palette)) return;

  const db = getDb();
  await db
    .update(siteSettings)
    .set({ activePalette: palette as Palette, updatedAt: new Date() })
    .where(eq(siteSettings.singleton, true));

  await writeAudit({
    actorId: owner.userId,
    action: "update",
    entityType: "site_settings",
    diff: { activePalette: palette },
    ipHash: hashIp(
      clientIpFromHeaders(await headers()) ?? "unknown",
      env.IP_HASH_SALT ?? "dev-insecure-salt",
    ),
  });
  revalidateTag("content:settings", "max");
  revalidatePath("/admin/parametres");
}
