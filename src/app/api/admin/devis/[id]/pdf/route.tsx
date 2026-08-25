import { renderToBuffer } from "@react-pdf/renderer";
import { QuoteDocument } from "@/components/admin/quote-pdf";
import { getCurrentAdmin } from "@/server/auth/guards";
import { getQuote } from "@/server/queries/admin";
import { getSiteSettings } from "@/server/queries/content";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const admin = await getCurrentAdmin();
  if (!admin.ok) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const data = await getQuote(id);
  if (!data) return new Response("Not found", { status: 404 });
  const settings = await getSiteSettings();

  const buffer = await renderToBuffer(
    <QuoteDocument quote={data.quote} items={data.items} settings={settings} />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${data.quote.number}.pdf"`,
    },
  });
}
