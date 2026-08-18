import postgres from "postgres";

/**
 * RLS test harness (SLV-141/142). Connects to a real Postgres (a disposable
 * Supabase branch in CI) — never a mock. Each check runs inside a rolled-back
 * transaction, impersonating a Postgres role + JWT claims so RLS applies
 * exactly as it would for anon / editor / owner clients.
 */
export const DB_URL = process.env.SUPABASE_DB_URL ?? "";
export const hasDb = DB_URL.length > 0;

export type Role = "anon" | "editor" | "owner";

const ROLLBACK = Symbol("rollback");

export function makeSql() {
  return postgres(DB_URL, { prepare: false, max: 1 });
}

/**
 * Run `fn` as the given role inside a transaction that is always rolled back,
 * so tests leave no residue. For editor/owner a throwaway auth.users +
 * admin_users row is created so auth.uid() resolves.
 */
export async function asRole<T, C = undefined>(
  sql: postgres.Sql,
  role: Role,
  fn: (tx: postgres.TransactionSql, ctx: C) => Promise<T>,
  seed?: (tx: postgres.TransactionSql) => Promise<C>,
): Promise<T> {
  let captured: T;
  try {
    await sql.begin(async (tx) => {
      // Seed runs as the connection role (table owner) before impersonation.
      const ctx = (seed ? await seed(tx) : undefined) as C;
      if (role === "anon") {
        await tx`set local role anon`;
      } else {
        const uid = (
          await tx`select public.uuid_generate_v7() as id`
        )[0]!.id as string;
        await tx`insert into auth.users (id, aud, role, email, created_at, updated_at)
                 values (${uid}, 'authenticated', 'authenticated', ${`${role}@test.solive`}, now(), now())`;
        await tx`insert into public.admin_users (id, email, role)
                 values (${uid}, ${`${role}@test.solive`}, ${role})`;
        await tx`set local role authenticated`;
        await tx.unsafe(
          `set local request.jwt.claims = '{"sub":"${uid}","role":"authenticated"}'`,
        );
      }
      captured = await fn(tx, ctx);
      throw ROLLBACK; // abort the tx; keep captured result
    });
  } catch (e) {
    if (e !== ROLLBACK) throw e;
  }
  return captured!;
}

/** True if the callback's write succeeded, false if RLS/trigger rejected it. */
export async function allowed(fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await fn();
    return true;
  } catch {
    return false;
  }
}
