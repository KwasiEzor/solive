const eur = new Intl.NumberFormat("fr-BE", {
  style: "currency",
  currency: "EUR",
});

// fr-BE groups thousands with a narrow no-break space (U+202F) — outside the
// WinAnsi encoding standard PDF fonts use, so react-pdf/pdfkit renders it as
// a stray "/" instead of a space. Normalize every non-breaking/narrow space
// variant to a plain space: safe everywhere, not just PDF output.
export function formatCentsEUR(cents: number): string {
  return eur.format(cents / 100).replace(/[  ]/g, " ");
}

/** Round-half-up to the nearest cent (money must never carry float drift). */
export function toCents(amount: number): number {
  return Math.round(amount);
}

export interface QuoteLineInput {
  quantity: number;
  unitPriceCents: number;
}

/** Per-line totals rounded first, then summed — avoids float drift across lines. */
export function computeQuoteTotals(items: QuoteLineInput[], vatRate: number) {
  const lineTotals = items.map((it) => toCents(it.quantity * it.unitPriceCents));
  const subtotalCents = lineTotals.reduce((a, b) => a + b, 0);
  const vatAmountCents = toCents((subtotalCents * vatRate) / 100);
  return {
    lineTotals,
    subtotalCents,
    vatAmountCents,
    totalCents: subtotalCents + vatAmountCents,
  };
}

/** Human-readable quote number, e.g. DEV-2026-0001. Resets per year. */
export function formatQuoteNumber(year: number, sequenceNumber: number): string {
  return `DEV-${year}-${String(sequenceNumber).padStart(4, "0")}`;
}
