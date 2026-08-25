"use server";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { passwordSchema } from "@/lib/schemas/auth";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/server/auth/supabase-admin";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";
import { getDb } from "@/server/db";
import { getInvitationStatus } from "@/server/queries/invitations";
import { isPasswordPwned } from "@/server/services/hibp";
import { writeAudit } from "@/server/services/audit";
import { adminUsers, invitations } from "../../../drizzle/schema";

export type AcceptInvitationResult =
  | { status: "ok" }
  | { status: "error"; message: string };

/**
 * Accept an invitation (SLV-011): create the Supabase auth user + admin_users
 * row from the invited email/role, mark the invitation used, and sign the
 * new admin in. MFA enrollment is enforced right after by the admin layout,
 * same as any other owner/editor.
 */
export async function acceptInvitationAction(input: {
  token: string;
  password: string;
  fullName?: string;
}): Promise<AcceptInvitationResult> {
  const status = await getInvitationStatus(input.token);
  if (status.state === "accepted") {
    return { status: "error", message: "Cette invitation a déjà été utilisée." };
  }
  if (status.state === "expired") {
    return {
      status: "error",
      message: "Cette invitation a expiré. Demandez-en une nouvelle.",
    };
  }
  if (status.state === "not_found") {
    return { status: "error", message: "Invitation introuvable." };
  }

  const parsedPw = passwordSchema.safeParse(input.password);
  if (!parsedPw.success) {
    return {
      status: "error",
      message: "Le mot de passe doit contenir au moins 12 caractères.",
    };
  }
  const pwned = await isPasswordPwned(parsedPw.data);
  if (pwned.ok && pwned.value) {
    return {
      status: "error",
      message:
        "Ce mot de passe figure dans une fuite de données connue. Choisissez-en un autre.",
    };
  }

  const admin = createSupabaseAdminClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser(
    { email: status.email, password: parsedPw.data, email_confirm: true },
  );
  if (createErr || !created.user) {
    return {
      status: "error",
      message: "Impossible de créer le compte. Contactez le propriétaire.",
    };
  }

  const db = getDb();
  const tokenHash = createHash("sha256").update(input.token).digest("hex");
  try {
    await db.insert(adminUsers).values({
      id: created.user.id,
      email: status.email,
      fullName: input.fullName?.trim() || null,
      role: status.role,
    });
    await db
      .update(invitations)
      .set({ acceptedAt: new Date() })
      .where(eq(invitations.tokenHash, tokenHash));
  } catch {
    await admin.auth.admin.deleteUser(created.user.id);
    return { status: "error", message: "Échec de la création du compte." };
  }

  // Sign the new admin in immediately (cookie-bound client sets the session).
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signInWithPassword({
    email: status.email,
    password: parsedPw.data,
  });

  const ipHash = hashIp(
    clientIpFromHeaders(await headers()) ?? "unknown",
    env.IP_HASH_SALT ?? "dev-insecure-salt",
  );
  await writeAudit({
    actorId: created.user.id,
    action: "create",
    entityType: "admin_user",
    entityId: created.user.id,
    ipHash,
    diff: { email: status.email, role: status.role, via: "invitation" },
  });

  return { status: "ok" };
}
