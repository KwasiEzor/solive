import "server-only";
import postgres from "postgres";
import { env } from "@/lib/env";

/**
 * Active session listing & revocation (SLV-046), read directly from
 * auth.sessions via the service-role DB connection (PostgREST does not expose
 * the auth schema). Revoking = deleting the session row.
 */
export interface UserSession {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  userAgent: string | null;
  ip: string | null;
  aal: string | null;
}

function sql() {
  if (!env.SUPABASE_DB_URL) {
    throw new Error("SUPABASE_DB_URL required for session management.");
  }
  return postgres(env.SUPABASE_DB_URL, { prepare: false, max: 1, ssl: "require" });
}

export async function listUserSessions(userId: string): Promise<UserSession[]> {
  const db = sql();
  try {
    const rows = await db<
      {
        id: string;
        created_at: string;
        updated_at: string | null;
        user_agent: string | null;
        ip: string | null;
        aal: string | null;
      }[]
    >`select id, created_at, updated_at, user_agent, ip::text as ip, aal::text as aal
      from auth.sessions where user_id = ${userId} order by updated_at desc nulls last`;
    return rows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      userAgent: r.user_agent,
      ip: r.ip,
      aal: r.aal,
    }));
  } finally {
    await db.end();
  }
}

/** Revoke one session (only if it belongs to the user). */
export async function revokeUserSession(
  userId: string,
  sessionId: string,
): Promise<void> {
  const db = sql();
  try {
    await db`delete from auth.sessions where id = ${sessionId} and user_id = ${userId}`;
  } finally {
    await db.end();
  }
}
