import { describe, expect, it } from "vitest";
import {
  COLLECTIONS,
  column,
  getCollection,
  isJsonField,
  listCollections,
  meta,
} from "@/server/admin/collections";

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

describe("getCollection", () => {
  it("returns the config for a known key", () => {
    expect(getCollection("services")).toBe(COLLECTIONS.services);
  });

  it("returns null for an unknown key", () => {
    expect(getCollection("does-not-exist")).toBeNull();
  });
});

describe("meta", () => {
  it("strips the Drizzle table, keeps everything else", () => {
    const cfg = COLLECTIONS.services!;
    const m = meta(cfg);
    expect(m).not.toHaveProperty("table");
    expect(m.key).toBe(cfg.key);
    expect(m.fields).toBe(cfg.fields);
    expect(m.listColumns).toBe(cfg.listColumns);
  });
});

describe("listCollections", () => {
  it("returns one serializable entry per registered collection, table-free", () => {
    const list = listCollections();
    expect(list).toHaveLength(Object.keys(COLLECTIONS).length);
    expect(list.map((c) => c.key).sort()).toEqual(
      Object.keys(COLLECTIONS).sort(),
    );
    for (const c of list) expect(c).not.toHaveProperty("table");
  });
});

describe("isJsonField", () => {
  it("is true for a field declared type: \"json\"", () => {
    expect(isJsonField(COLLECTIONS.projects!, "body")).toBe(true);
  });

  it("is false for a non-json field", () => {
    expect(isJsonField(COLLECTIONS.projects!, "title")).toBe(false);
  });

  it("is false for a field name that doesn't exist on the config", () => {
    expect(isJsonField(COLLECTIONS.projects!, "nope")).toBe(false);
  });
});
