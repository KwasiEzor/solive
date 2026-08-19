"use server";
import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { inviteSchema, roleSchema } from "@/lib/schemas/auth";
import { requireOwner, requireRecentReauth } from "@/server/auth/guards";
import { getDb } from "@/server/db";
import { writeAudit } from "@/server/services/audit";
import { adminUsers, invitations } from "../../../drizzle/schema";

const USERS_PATH = "/admin/utilisateurs";

/** Create an invitation (SLV-011/070). Email delivery is wired in Phase 6. */
export async function inviteUserAction(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  await requireRecentReauth();

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) redirect(`${USERS_PATH}?error=invalid`);

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const db = getDb();
  await db.insert(invitations).values({
    email: parsed.data.email,
    role: parsed.data.role,
    tokenHash,
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
    invitedBy: owner.userId,
  });
  await writeAudit({
    actorId: owner.userId,
    action: "invite",
    entityType: "invitation",
    diff: { email: parsed.data.email, role: parsed.data.role },
  });
  // Token surfaced once so the owner can share the accept link (email: Phase 6).
  redirect(`${USERS_PATH}?invited=${token}`);
}

export async function changeRoleAction(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  await requireRecentReauth();
  const userId = String(formData.get("userId") ?? "");
  const parsed = roleSchema.safeParse(formData.get("role"));
  if (!userId || !parsed.success) redirect(`${USERS_PATH}?error=invalid`);

  const db = getDb();
  try {
    await db
      .update(adminUsers)
      .set({ role: parsed.data })
      .where(eq(adminUsers.id, userId));
  } catch {
    redirect(`${USERS_PATH}?error=last_owner`);
  }
  await writeAudit({
    actorId: owner.userId,
    action: "role_change",
    entityType: "admin_user",
    entityId: userId,
    diff: { role: parsed.data },
  });
  revalidatePath(USERS_PATH);
}

export async function setUserDisabledAction(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  await requireRecentReauth();
  const userId = String(formData.get("userId") ?? "");
  const disable = formData.get("disable") === "1";
  if (!userId) redirect(`${USERS_PATH}?error=invalid`);

  const db = getDb();
  try {
    await db
      .update(adminUsers)
      .set({ disabledAt: disable ? new Date() : null })
      .where(eq(adminUsers.id, userId));
  } catch {
    redirect(`${USERS_PATH}?error=last_owner`);
  }
  await writeAudit({
    actorId: owner.userId,
    action: "update",
    entityType: "admin_user",
    entityId: userId,
    diff: { disabled: disable },
  });
  revalidatePath(USERS_PATH);
}
