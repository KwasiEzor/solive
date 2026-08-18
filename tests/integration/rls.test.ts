import { describe, expect, it } from "vitest";
import { allowed, asRole, hasDb, makeSql } from "./helpers/rls";

/**
 * RLS policy tests (SLV-035 → 039). Runs against a real Postgres; skipped when
 * SUPABASE_DB_URL is unset. A policy without a passing test here is treated as
 * absent (SLV-039).
 *
 * Test rows use locale 'nl' to isolate from the committed 'fr' dev seed, and
 * everything runs in a rolled-back transaction. RLS denies SELECT/UPDATE by
 * filtering rows (0 rows), and denies INSERT by raising — asserted accordingly.
 */
const sql = hasDb ? makeSql() : null;

// key/slug unique per (·, locale); published + draft use distinct keys/slugs.
const seedRow: Record<string, { pub: string; draft: string }> = {
  sections: {
    pub: `(key, locale, status) values ('hero','nl','published')`,
    draft: `(key, locale, status) values ('services','nl','draft')`,
  },
  services: {
    pub: `(title, locale, status) values ('t','nl','published')`,
    draft: `(title, locale, status) values ('t','nl','draft')`,
  },
  process_steps: {
    pub: `(number, title, locale, status) values ('01','t','nl','published')`,
    draft: `(number, title, locale, status) values ('02','t','nl','draft')`,
  },
  projects: {
    pub: `(slug, title, locale, status) values ('a','t','nl','published')`,
    draft: `(slug, title, locale, status) values ('b','t','nl','draft')`,
  },
  pricing_plans: {
    pub: `(name, locale, status) values ('n','nl','published')`,
    draft: `(name, locale, status) values ('n','nl','draft')`,
  },
  faq_items: {
    pub: `(question, locale, status) values ('q','nl','published')`,
    draft: `(question, locale, status) values ('q','nl','draft')`,
  },
};
const CONTENT_TABLES = Object.keys(seedRow);

describe.skipIf(!hasDb)("RLS", () => {
  describe("content: anon reads published, never drafts (SLV-035)", () => {
    it.each(CONTENT_TABLES)("%s", async (table) => {
      const res = await asRole(
        sql!,
        "anon",
        async (tx) => {
          const published = await tx.unsafe(
            `select count(*)::int n from public.${table} where status='published' and locale='nl'`,
          );
          const drafts = await tx.unsafe(
            `select count(*)::int n from public.${table} where status='draft' and locale='nl'`,
          );
          return { published: published[0]!.n, drafts: drafts[0]!.n };
        },
        async (tx) => {
          await tx.unsafe(`insert into public.${table} ${seedRow[table]!.pub}`);
          await tx.unsafe(`insert into public.${table} ${seedRow[table]!.draft}`);
        },
      );
      expect(res.published).toBe(1);
      expect(res.drafts).toBe(0); // drafts invisible to anon
    });
  });

  describe("content write authorization (SLV-036/038)", () => {
    it("anon cannot insert a section", async () => {
      const ok = await asRole(sql!, "anon", (tx) =>
        allowed(
          () =>
            tx`insert into public.sections (key, locale) values ('hero','nl')`,
        ),
      );
      expect(ok).toBe(false);
    });

    it.each(["editor", "owner"] as const)(
      "%s can insert & publish a section",
      async (role) => {
        const ok = await asRole(sql!, role, (tx) =>
          allowed(
            () =>
              tx`insert into public.sections (key, locale, status) values ('hero','nl','published')`,
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
    // RLS filters UPDATE rows rather than raising — assert on affected count.
    it("editor cannot update site_settings, owner can", async () => {
      const editorCount = await asRole(sql!, "editor", async (tx) => {
        const r = await tx`update public.site_settings set name='x' where singleton = true`;
        return r.count;
      });
      const ownerCount = await asRole(sql!, "owner", async (tx) => {
        const r = await tx`update public.site_settings set name='x' where singleton = true`;
        return r.count;
      });
      expect(editorCount).toBe(0);
      expect(ownerCount).toBe(1);
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
