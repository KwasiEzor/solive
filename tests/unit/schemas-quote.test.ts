import { describe, expect, it } from "vitest";
import { computeQuoteTotals, formatCentsEUR, formatQuoteNumber } from "@/lib/money";
import { quoteItemInputSchema, updateQuoteSchema } from "@/lib/schemas/quote";

const baseItem = { description: "Site vitrine", quantity: 1, unitPriceCents: 250000 };

describe("quoteItemInputSchema", () => {
  it("accepts a valid line item", () => {
    expect(quoteItemInputSchema.safeParse(baseItem).success).toBe(true);
  });

  it("rejects an empty description", () => {
    expect(
      quoteItemInputSchema.safeParse({ ...baseItem, description: "" }).success,
    ).toBe(false);
  });

  it("rejects a negative unit price", () => {
    expect(
      quoteItemInputSchema.safeParse({ ...baseItem, unitPriceCents: -1 }).success,
    ).toBe(false);
  });
});

describe("updateQuoteSchema", () => {
  const base = {
    id: "018f9b8e-7c2a-7e3a-9f1a-2b3c4d5e6f70",
    clientName: "Camille",
    clientEmail: "camille@entreprise.be",
    vatRate: 21,
    items: [baseItem],
    expectedUpdatedAt: new Date().toISOString(),
  };

  it("accepts a valid quote", () => {
    expect(updateQuoteSchema.safeParse(base).success).toBe(true);
  });

  it("requires at least one line item", () => {
    expect(updateQuoteSchema.safeParse({ ...base, items: [] }).success).toBe(false);
  });

  it("rejects a VAT rate outside 0-100", () => {
    expect(updateQuoteSchema.safeParse({ ...base, vatRate: 150 }).success).toBe(false);
  });
});

describe("computeQuoteTotals", () => {
  it("rounds each line before summing (no float drift)", () => {
    // 3 x 33.33 = 99.99 exactly at the line level, no leftover cent.
    const r = computeQuoteTotals([{ quantity: 3, unitPriceCents: 3333 }], 0);
    expect(r.subtotalCents).toBe(9999);
    expect(r.totalCents).toBe(9999);
  });

  it("applies VAT and sums multiple lines", () => {
    const r = computeQuoteTotals(
      [
        { quantity: 1, unitPriceCents: 100000 },
        { quantity: 2, unitPriceCents: 5000 },
      ],
      21,
    );
    expect(r.subtotalCents).toBe(110000);
    expect(r.vatAmountCents).toBe(23100);
    expect(r.totalCents).toBe(133100);
  });

  it("supports 0% reverse-charge VAT", () => {
    const r = computeQuoteTotals([{ quantity: 1, unitPriceCents: 100000 }], 0);
    expect(r.vatAmountCents).toBe(0);
    expect(r.totalCents).toBe(100000);
  });
});

describe("formatQuoteNumber", () => {
  it("pads the sequence to 4 digits", () => {
    expect(formatQuoteNumber(2026, 1)).toBe("DEV-2026-0001");
    expect(formatQuoteNumber(2026, 42)).toBe("DEV-2026-0042");
  });
});

describe("formatCentsEUR", () => {
  it("formats cents as a EUR amount", () => {
    const formatted = formatCentsEUR(133100);
    expect(formatted).toContain("331,00");
    expect(formatted).toContain("€");
  });
});
