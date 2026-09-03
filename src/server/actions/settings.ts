"use server";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { env } from "@/lib/env";
import { PALETTES, type Palette } from "@/lib/palette";
import { requireOwner } from "@/server/auth/guards";
import { getDb } from "@/server/db";
import { writeAudit } from "@/server/services/audit";
import { siteSettings } from "../../../drizzle/schema";

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
  // updateTag (not revalidateTag): the admin must see their own change
  // immediately, not after a stale-while-revalidate window.
  updateTag("content:settings");
  revalidatePath("/admin/parametres");
}

/**
 * Show/hide the floating CTA and palette-switcher buttons on the public site
 * (SLV-067-adjacent). Owner-only, same shape as updatePaletteAction.
 */
export async function updateVisibilityAction(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  const showFloatCta = formData.get("showFloatCta") === "1";
  const showThemeSwitcher = formData.get("showThemeSwitcher") === "1";

  const db = getDb();
  await db
    .update(siteSettings)
    .set({ showFloatCta, showThemeSwitcher, updatedAt: new Date() })
    .where(eq(siteSettings.singleton, true));

  await writeAudit({
    actorId: owner.userId,
    action: "update",
    entityType: "site_settings",
    diff: { showFloatCta, showThemeSwitcher },
    ipHash: hashIp(
      clientIpFromHeaders(await headers()) ?? "unknown",
      env.IP_HASH_SALT ?? "dev-insecure-salt",
    ),
  });
  // updateTag (not revalidateTag): the admin must see their own change
  // immediately, not after a stale-while-revalidate window.
  updateTag("content:settings");
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
  // updateTag (not revalidateTag): the admin must see their own change
  // immediately, not after a stale-while-revalidate window.
  updateTag("content:settings");
  revalidatePath("/admin/parametres");
}
