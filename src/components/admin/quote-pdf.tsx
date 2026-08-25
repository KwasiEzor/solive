import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatCentsEUR } from "@/lib/money";
import type { Quote, QuoteItem, SiteSettings } from "@/server/db/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  studioName: { fontSize: 14, fontWeight: 700 },
  dim: { color: "#666666" },
  h1: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  block: { marginBottom: 20 },
  row: { flexDirection: "row" },
  table: { marginTop: 8, borderTopWidth: 1, borderTopColor: "#dddddd" },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    paddingVertical: 6,
  },
  thDesc: { flex: 4 },
  thQty: { flex: 1, textAlign: "right" },
  thPrice: { flex: 1.5, textAlign: "right" },
  thTotal: { flex: 1.5, textAlign: "right" },
  totals: { marginTop: 16, alignSelf: "flex-end", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalsFinal: { fontWeight: 700, borderTopWidth: 1, borderTopColor: "#1a1a1a", paddingTop: 6 },
  footer: { position: "absolute", bottom: 32, left: 40, right: 40, fontSize: 8, color: "#999999" },
});

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("fr-BE");
}

export function QuoteDocument({
  quote,
  items,
  settings,
}: {
  quote: Quote;
  items: QuoteItem[];
  settings: SiteSettings | null;
}) {
  return (
    <Document title={quote.number}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.studioName}>{settings?.name ?? "Solive"}</Text>
            {settings?.baseline && <Text style={styles.dim}>{settings.baseline}</Text>}
            {settings?.address && <Text style={styles.dim}>{settings.address}</Text>}
            {settings?.email && <Text style={styles.dim}>{settings.email}</Text>}
            {settings?.phone && <Text style={styles.dim}>{settings.phone}</Text>}
            {settings?.vat && <Text style={styles.dim}>TVA {settings.vat}</Text>}
          </View>
          <View>
            <Text style={styles.h1}>DEVIS</Text>
            <Text>{quote.number}</Text>
            <Text style={styles.dim}>Émis le {fmtDate(quote.createdAt)}</Text>
            <Text style={styles.dim}>Valable jusqu’au {fmtDate(quote.validUntil)}</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.dim}>Destinataire</Text>
          <Text>{quote.clientName}</Text>
          {quote.clientCompany && <Text>{quote.clientCompany}</Text>}
          <Text>{quote.clientEmail}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tr, { fontWeight: 700 }]}>
            <Text style={styles.thDesc}>Description</Text>
            <Text style={styles.thQty}>Qté</Text>
            <Text style={styles.thPrice}>Prix unit.</Text>
            <Text style={styles.thTotal}>Total</Text>
          </View>
          {items.map((it) => (
            <View style={styles.tr} key={it.id}>
              <Text style={styles.thDesc}>{it.description}</Text>
              <Text style={styles.thQty}>{Number(it.quantity)}</Text>
              <Text style={styles.thPrice}>{formatCentsEUR(it.unitPriceCents)}</Text>
              <Text style={styles.thTotal}>{formatCentsEUR(it.lineTotalCents)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text>Sous-total</Text>
            <Text>{formatCentsEUR(quote.subtotalCents)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>TVA ({quote.vatRate}%)</Text>
            <Text>{formatCentsEUR(quote.vatAmountCents)}</Text>
          </View>
          <View style={[styles.totalsRow, styles.totalsFinal]}>
            <Text>Total</Text>
            <Text>{formatCentsEUR(quote.totalCents)}</Text>
          </View>
        </View>

        {quote.notes && (
          <View style={styles.block}>
            <Text style={styles.dim}>Notes</Text>
            <Text>{quote.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {settings?.name ?? "Solive"} — Devis {quote.number}
        </Text>
      </Page>
    </Document>
  );
}
