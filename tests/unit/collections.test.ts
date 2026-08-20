import { describe, expect, it } from "vitest";
import { COLLECTIONS, column } from "@/server/admin/collections";

// Every field / title / list column referenced by a collection config must map
// to a real Drizzle column — otherwise create/update/reorder would throw at
// runtime. The standard columns the actions rely on must exist too.
const STANDARD = ["id", "sortOrder", "deletedAt", "status", "updatedAt"];

describe("admin collections config", () => {
  for (const [key, cfg] of Object.entries(COLLECTIONS)) {
    it(`${key}: all referenced columns exist on the table`, () => {
      const names = new Set([
        ...cfg.fields.map((f) => f.name),
        cfg.titleField,
        ...cfg.listColumns,
        ...STANDARD,
      ]);
      for (const n of names) {
        expect(column(cfg, n), `${key}.${n} missing`).toBeDefined();
      }
    });

    it(`${key}: contentTag looks valid`, () => {
      expect(cfg.contentTag.startsWith("content:")).toBe(true);
    });
  }
});
