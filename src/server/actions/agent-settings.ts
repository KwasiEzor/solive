"use server";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { env } from "@/lib/env";
import { requireOwner } from "@/server/auth/guards";
import { getDb } from "@/server/db";
import { writeAudit } from "@/server/services/audit";
import { encryptSecret } from "@/server/services/secrets";
import { agentSettings } from "../../../drizzle/schema";

const MODELS = ["claude-haiku-4-5", "claude-sonnet-4-5"] as const;

async function ipHash() {
  return hashIp(
    clientIpFromHeaders(await headers()) ?? "unknown",
    env.IP_HASH_SALT ?? "dev-insecure-salt",
  );
}

/** Same invalidation shape as settings.ts: updateTag for immediate self-
 * visibility, revalidatePath for the admin page itself. */
function invalidate() {
  updateTag("content:agent_settings");
  revalidatePath("/admin/agent-ia");
}

/**
 * Enable toggle, model, and custom instructions — never touches the stored
 * credentials (see updateAgentCredentialsAction below, a separate form so
 * re-saving instructions never requires re-pasting the key).
 */
export async function updateAgentConfigAction(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  const enabled = formData.get("enabled") === "1";
  const model = String(formData.get("model") ?? "");
  if (!MODELS.includes(model as (typeof MODELS)[number])) return;
  const instructionsFr = String(formData.get("instructionsFr") ?? "").trim();
  const instructionsEn = String(formData.get("instructionsEn") ?? "").trim();

  const db = getDb();
  await db
    .update(agentSettings)
    .set({
      enabled,
      model,
      instructionsFr: instructionsFr || null,
      instructionsEn: instructionsEn || null,
      updatedAt: new Date(),
    })
    .where(eq(agentSettings.singleton, true));

  await writeAudit({
    actorId: owner.userId,
    action: "update",
    entityType: "agent_settings",
    diff: { enabled, model, instructionsFr: Boolean(instructionsFr), instructionsEn: Boolean(instructionsEn) },
    ipHash: await ipHash(),
  });
  invalidate();
}

/**
 * A blank field means "keep the existing value" (inputs show a "•••• se
 * termine par XXXX" placeholder, never the real value) — only a non-empty
 * paste replaces the stored credential. Symmetrical: leaving both blank is
 * a harmless no-op save.
 */
export async function updateAgentCredentialsAction(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  const apiKey = String(formData.get("apiKey") ?? "").trim();
  const workspaceId = String(formData.get("workspaceId") ?? "").trim();
  if (!apiKey && !workspaceId) return;

  const db = getDb();
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (apiKey) {
    set.anthropicApiKeyEnc = encryptSecret(apiKey);
    set.anthropicApiKeyLast4 = apiKey.slice(-4);
  }
  if (workspaceId) {
    set.anthropicWorkspaceIdEnc = encryptSecret(workspaceId);
    set.anthropicWorkspaceIdLast4 = workspaceId.slice(-4);
  }
  await db.update(agentSettings).set(set).where(eq(agentSettings.singleton, true));

  await writeAudit({
    actorId: owner.userId,
    action: "update",
    entityType: "agent_settings",
    diff: { apiKeyChanged: Boolean(apiKey), workspaceIdChanged: Boolean(workspaceId) },
    ipHash: await ipHash(),
  });
  invalidate();
}

/** Explicit clear — falls back to ANTHROPIC_API_KEY/ANTHROPIC_WORKSPACE_ID
 * env vars (src/lib/agents/qualification-agent.ts) once cleared. */
export async function clearAgentCredentialAction(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  const field = String(formData.get("field") ?? "");
  if (field !== "apiKey" && field !== "workspaceId") return;

  const db = getDb();
  const set =
    field === "apiKey"
      ? { anthropicApiKeyEnc: null, anthropicApiKeyLast4: null, updatedAt: new Date() }
      : { anthropicWorkspaceIdEnc: null, anthropicWorkspaceIdLast4: null, updatedAt: new Date() };
  await db.update(agentSettings).set(set).where(eq(agentSettings.singleton, true));

  await writeAudit({
    actorId: owner.userId,
    action: "update",
    entityType: "agent_settings",
    diff: { [`${field}Cleared`]: true },
    ipHash: await ipHash(),
  });
  invalidate();
}
