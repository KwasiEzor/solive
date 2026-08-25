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

/**
 * Studio's own letterhead info (name, address, VAT…) — used on generated
 * quote PDFs. Owner-only, same shape as updatePaletteAction.
 */
export async function updateCompanyInfoAction(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  const name = String(formData.get("name") ?? "").trim();
  const baseline = String(formData.get("baseline") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const vat = String(formData.get("vat") ?? "").trim();
  if (!name) return;

  const db = getDb();
  await db
    .update(siteSettings)
    .set({
      name,
      baseline: baseline || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      vat: vat || null,
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.singleton, true));

  await writeAudit({
    actorId: owner.userId,
    action: "update",
    entityType: "site_settings",
    diff: { name, baseline, email, phone, address, vat },
    ipHash: hashIp(
      clientIpFromHeaders(await headers()) ?? "unknown",
      env.IP_HASH_SALT ?? "dev-insecure-salt",
    ),
  });
  revalidateTag("content:settings", "max");
  revalidatePath("/admin/parametres");
}
