import { Document, Page, renderToBuffer, Text } from "@react-pdf/renderer";

// Temporary diagnostic route: isolate whether a MINIMAL react-pdf render (no
// custom fonts, no app component) already crashes on Helvetica in this
// environment, vs. something specific to QuoteDocument. Deleted after use.
export async function GET() {
  const buffer = await renderToBuffer(
    <Document>
      <Page size="A4">
        <Text>hello</Text>
      </Page>
    </Document>,
  );

  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/pdf" },
  });
}
