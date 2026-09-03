import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type AckLocale = "fr" | "en";

export interface LeadAcknowledgmentProps {
  firstName: string;
  locale: AckLocale;
}

const COPY: Record<
  AckLocale,
  { preview: string; heading: (n: string) => string; body: string; sign: string }
> = {
  fr: {
    preview: "Nous avons bien reçu votre demande",
    heading: (n) => `Merci ${n}.`,
    body: "Votre demande est bien arrivée. Je reviens vers vous sous 24 h ouvrées avec deux ou trois questions et une proposition de créneau.",
    sign: "Solive — studio de développement, Charleroi",
  },
  en: {
    preview: "We’ve received your request",
    heading: (n) => `Thank you, ${n}.`,
    body: "Your request has arrived. I’ll get back to you within 24 business hours with a couple of questions and a proposed time to talk.",
    sign: "Solive — development studio, Charleroi",
  },
};

const main = { backgroundColor: "#f4f4f1", fontFamily: "Arial, sans-serif" };
const container = { maxWidth: "520px", margin: "0 auto", padding: "24px" };
const card = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "28px",
  border: "1px solid #e5e5e0",
};

export function LeadAcknowledgment({
  firstName,
  locale,
}: LeadAcknowledgmentProps) {
  const c = COPY[locale] ?? COPY.fr;
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{c.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Heading style={{ color: "#14171a", fontSize: "20px" }}>
              {c.heading(firstName)}
            </Heading>
            <Text style={{ color: "#14171a", fontSize: "15px", lineHeight: "1.6" }}>
              {c.body}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: "13px", marginTop: "20px" }}>
              {c.sign}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default LeadAcknowledgment;
