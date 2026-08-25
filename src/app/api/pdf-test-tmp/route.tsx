import { renderToBuffer } from "@react-pdf/renderer";
import { QuoteDocument } from "@/components/admin/quote-pdf";
import type { Quote, QuoteItem, SiteSettings } from "@/server/db/types";

// Temporary diagnostic route (fake data, no auth) — final confirmation pass
// for the pdfkit patch fix. Deleted immediately after verification.
export async function GET() {
  const quote = {
    id: "test",
    number: "DEV-2026-0001",
    year: 2026,
    sequenceNumber: 1,
    leadId: null,
    clientName: "Camille Dupont",
    clientEmail: "camille@menuiserie-test.be",
    clientCompany: "Menuiserie Dupont",
    status: "draft",
    vatRate: "21.00",
    subtotalCents: 250000,
    vatAmountCents: 52500,
    totalCents: 302500,
    validUntil: new Date("2026-09-25"),
    notes: "Accents test : éèêëàâùûüôçœ.",
    sentAt: null,
    createdAt: new Date("2026-08-26"),
    updatedAt: new Date("2026-08-26"),
    deletedAt: null,
  } as unknown as Quote;

  const items = [
    {
      id: "item1",
      quoteId: "test",
      description: "Site vitrine — développement",
      quantity: "1.00",
      unitPriceCents: 250000,
      lineTotalCents: 250000,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ] as unknown as QuoteItem[];

  const settings = {
    id: "s1",
    name: "Solive",
    baseline: "studio de développement",
    email: "bonjour@solive.pro",
    phone: "+32 000 00 00 00",
    address: "Charleroi, Belgique",
    vat: "BE 0000.000.000",
    socials: {},
    activePalette: "chaux",
    enabledLocales: ["fr"],
    singleton: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as SiteSettings;

  const buffer = await renderToBuffer(
    <QuoteDocument quote={quote} items={items} settings={settings} />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/pdf" },
  });
}
