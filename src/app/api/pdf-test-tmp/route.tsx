import { Document, Font, Page, renderToBuffer, Text } from "@react-pdf/renderer";
import { PDF_SANS_REGULAR_DATA_URI } from "@/components/admin/pdf-fonts";

Font.register({
  family: "Sans",
  fonts: [{ src: PDF_SANS_REGULAR_DATA_URI, fontWeight: 400 }],
});

// Temporary diagnostic route: does an explicit custom fontFamily (never
// touching the "Helvetica" default) avoid the crash entirely? Deleted after use.
export async function GET() {
  const buffer = await renderToBuffer(
    <Document>
      <Page size="A4">
        <Text style={{ fontFamily: "Sans" }}>bonjour éèêë</Text>
      </Page>
    </Document>,
  );

  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/pdf" },
  });
}
