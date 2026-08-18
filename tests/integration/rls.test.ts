import { describe, expect, it } from "vitest";
import { allowed, asRole, hasDb, makeSql } from "./helpers/rls";

/**
 * RLS policy tests (SLV-035 → 039). Runs against a real Postgres; skipped when
 * SUPABASE_DB_URL is unset. A policy without a passing test here is treated as
 * absent (SLV-039).
 */
const sql = hasDb ? makeSql() : null;

const CONTENT_TABLES = [
  "sections",
  "services",
  "process_steps",
  "projects",
  "pricing_plans",
  "faq_items",
] as const;

// minimal required columns per content table to satisfy NOT NULLs
const seedRow: Record<string, (status: string) => string> = {
  sections: (s) => `(key, status) values ('faq', '${s}')`,
  services: (s) => `(title, status) values ('t', '${s}')`,
  process_steps: (s) => `(number, title, status) values ('01', 't', '${s}')`,
  projects: (s) => `(slug, title, status) values ('p-${s}', 't', '${s}')`,
  pricing_plans: (s) => `(name, status) values ('n', '${s}')`,
  faq_items: (s) => `(question, status) values ('q', '${s}')`,
};

describe.skipIf(!hasDb)("RLS", () => {
  describe("content: anon reads published, never drafts (SLV-035)", () => {
    it.each(CONTENT_TABLES)("%s", async (table) => {
      const res = await asRole(
        sql!,
        "anon",
        async (tx) => {
          const published = await tx.unsafe(
            `select count(*)::int n from public.${table} where status='published'`,
          );
          const drafts = await tx.unsafe(
            `select count(*)::int n from public.${table} where status='draft'`,
          );
          return { published: published[0]!.n, drafts: drafts[0]!.n };
        },
        async (tx) => {
          await tx.unsafe(
            `insert into public.${table} ${seedRow[table]!("published")}`,
          );
          await tx.unsafe(
            `insert into public.${table} ${seedRow[table]!("draft")}`,
          );
        },
      );
      expect(res.published).toBe(1);
      expect(res.drafts).toBe(0); // drafts invisible to anon
    });
  });

  describe("content write authorization (SLV-036/038)", () => {
    it("anon cannot insert a section", async () => {
      const ok = await asRole(sql!, "anon", (tx) =>
        allowed(() => tx`insert into public.sections (key) values ('hero')`),
      );
      expect(ok).toBe(false);
    });

    it.each(["editor", "owner"] as const)(
      "%s can insert & publish a section",
      async (role) => {
        const ok = await asRole(sql!, role, (tx) =>
          allowed(
            () =>
              tx`insert into public.sections (key, status) values ('hero','published')`,
          ),
        );
        expect(ok).toBe(true);
      },
    );
  });

  describe("leads (SLV-037)", () => {
    it("anon can insert a lead", async () => {
      const ok = await asRole(sql!, "anon", (tx) =>
        allowed(
          () =>
            tx`insert into public.leads (client_id,name,email,message)
               values (public.uuid_generate_v7(),'A','a@a.be','a message here')`,
        ),
      );
      expect(ok).toBe(true);
    });

    it("anon cannot read leads", async () => {
      const n = await asRole(
        sql!,
        "anon",
        async (tx) => (await tx`select count(*)::int n from public.leads`)[0]!.n,
        async (tx) => {
          await tx`insert into public.leads (client_id,name,email,message)
                   values (public.uuid_generate_v7(),'A','a@a.be','secret lead body')`;
        },
      );
      expect(n).toBe(0);
    });

    it("admin can read leads", async () => {
      const n = await asRole(
        sql!,
        "owner",
        async (tx) => (await tx`select count(*)::int n from public.leads`)[0]!.n,
        async (tx) => {
          await tx`insert into public.leads (client_id,name,email,message)
                   values (public.uuid_generate_v7(),'A','a@a.be','visible to admin')`;
        },
      );
      expect(n).toBeGreaterThanOrEqual(1);
    });
  });

  describe("audit log (SLV-012/069)", () => {
    it("owner can read the audit log, editor cannot", async () => {
      const seed = async (tx: import("postgres").TransactionSql) => {
        await tx`insert into public.audit_log (action, entity_type) values ('login','session')`;
      };
      const ownerN = await asRole(
        sql!,
        "owner",
        async (tx) =>
          (await tx`select count(*)::int n from public.audit_log`)[0]!.n,
        seed,
      );
      const editorN = await asRole(
        sql!,
        "editor",
        async (tx) =>
          (await tx`select count(*)::int n from public.audit_log`)[0]!.n,
        seed,
      );
      expect(ownerN).toBeGreaterThanOrEqual(1);
      expect(editorN).toBe(0);
    });
  });

  describe("privilege separation editor vs owner (SLV-038)", () => {
    it("editor cannot write site_settings, owner can", async () => {
      const editorOk = await asRole(sql!, "editor", (tx) =>
        allowed(
          () => tx`update public.site_settings set name='x' where singleton = true`,
        ),
      );
      const ownerOk = await asRole(sql!, "owner", (tx) =>
        allowed(
          () => tx`update public.site_settings set name='x' where singleton = true`,
        ),
      );
      expect(editorOk).toBe(false);
      expect(ownerOk).toBe(true);
    });

    it("editor cannot create invitations, owner can", async () => {
      const editorOk = await asRole(sql!, "editor", (tx) =>
        allowed(
          () =>
            tx`insert into public.invitations (email, token_hash, expires_at)
               values ('x@y.be','h', now() + interval '72 hours')`,
        ),
      );
      const ownerOk = await asRole(sql!, "owner", (tx) =>
        allowed(
          () =>
            tx`insert into public.invitations (email, token_hash, expires_at)
               values ('x@y.be','h', now() + interval '72 hours')`,
        ),
      );
      expect(editorOk).toBe(false);
      expect(ownerOk).toBe(true);
    });
  });
});
