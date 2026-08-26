"use server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { env } from "@/lib/env";
import { profileSchema } from "@/lib/schemas/profile";
import { requireAdmin } from "@/server/auth/guards";
import { getDb } from "@/server/db";
import { writeAudit } from "@/server/services/audit";
import { adminUsers } from "../../../drizzle/schema";
import { requestPasswordResetAction, type ActionResult } from "./password";

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = profileSchema.safeParse({ fullName: formData.get("fullName") });
  if (!parsed.success) return { status: "error", message: "Nom invalide." };

  const db = getDb();
  await db
    .update(adminUsers)
    .set({ fullName: parsed.data.fullName, updatedAt: new Date() })
    .where(eq(adminUsers.id, admin.userId));

  await writeAudit({
    actorId: admin.userId,
    action: "update",
    entityType: "admin_user",
    entityId: admin.userId,
    diff: { fullName: parsed.data.fullName },
    ipHash: hashIp(
      clientIpFromHeaders(await headers()) ?? "unknown",
      env.IP_HASH_SALT ?? "dev-insecure-salt",
    ),
  });
  revalidatePath("/admin/profil");
  return { status: "ok" };
}

/** Sends the logged-in admin a password-reset link (reuses the public flow). */
export async function sendMyPasswordResetLinkAction(): Promise<ActionResult> {
  const admin = await requireAdmin();
  return requestPasswordResetAction({ email: admin.email });
}
