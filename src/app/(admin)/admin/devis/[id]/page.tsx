import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuoteEditor } from "@/components/admin/quote-editor";
import { getQuote } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "Devis",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ id: string }> };

export default async function QuoteDetailPage({ params }: Params) {
  const { id } = await params;
  const data = await getQuote(id);
  if (!data) notFound();
  const { quote, items } = data;

  return (
    <QuoteEditor
      quote={{
        id: quote.id,
        number: quote.number,
        status: quote.status,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientCompany: quote.clientCompany,
        vatRate: quote.vatRate,
        validUntil: quote.validUntil ? quote.validUntil.toISOString() : null,
        notes: quote.notes,
        updatedAt: quote.updatedAt.toISOString(),
      }}
      items={items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity),
        unitPriceCents: it.unitPriceCents,
      }))}
    />
  );
}
