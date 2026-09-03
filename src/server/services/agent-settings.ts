import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { decryptSecret } from "@/server/services/secrets";
import { agentSettings } from "../../../drizzle/schema";

export interface AgentRuntimeConfig {
  enabled: boolean;
  model: string;
  apiKey: string | null;
  workspaceId: string | null;
  instructionsFr: string | null;
  instructionsEn: string | null;
}

/**
 * The only place that decrypts the stored Anthropic credentials — never
 * cached (a single row select per chat request, called from the already-
 * dynamic /api/agent/chat Route Handler and nowhere else). Returns null if
 * the singleton row is somehow missing (migration not yet applied), letting
 * the caller fall back to env vars entirely.
 */
export async function getAgentRuntimeConfig(): Promise<AgentRuntimeConfig | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(agentSettings)
    .where(eq(agentSettings.singleton, true))
    .limit(1);
  if (!row) return null;

  return {
    enabled: row.enabled,
    model: row.model,
    apiKey: row.anthropicApiKeyEnc ? decryptSecret(row.anthropicApiKeyEnc) : null,
    workspaceId: row.anthropicWorkspaceIdEnc
      ? decryptSecret(row.anthropicWorkspaceIdEnc)
      : null,
    instructionsFr: row.instructionsFr,
    instructionsEn: row.instructionsEn,
  };
}
