import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface LeadNotificationProps {
  name: string;
  email: string;
  company?: string | null;
  projectTypes: string[];
  budgetRange?: string | null;
  message: string;
  adminUrl: string;
}

const main = { backgroundColor: "#f4f4f1", fontFamily: "Arial, sans-serif" };
const container = { maxWidth: "560px", margin: "0 auto", padding: "24px" };
const card = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "28px",
  border: "1px solid #e5e5e0",
};
const label = { color: "#6b7280", fontSize: "12px", margin: "0 0 2px" };
const value = { color: "#14171a", fontSize: "15px", margin: "0 0 14px" };
const btn = {
  backgroundColor: "#0a7a57",
  color: "#ffffff",
  borderRadius: "8px",
  padding: "11px 18px",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "bold",
};

export function LeadNotification({
  name,
  email,
  company,
  projectTypes,
  budgetRange,
  message,
  adminUrl,
}: LeadNotificationProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Nouvelle demande de {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Heading style={{ color: "#14171a", fontSize: "20px" }}>
              Nouvelle demande
            </Heading>
            <Text style={label}>Nom</Text>
            <Text style={value}>{name}</Text>
            <Text style={label}>E-mail</Text>
            <Text style={value}>
              <Link href={`mailto:${email}`} style={{ color: "#0a7a57" }}>
                {email}
              </Link>
            </Text>
            {company && (
              <>
                <Text style={label}>Entreprise</Text>
                <Text style={value}>{company}</Text>
              </>
            )}
            {projectTypes.length > 0 && (
              <>
                <Text style={label}>Type de projet</Text>
                <Text style={value}>{projectTypes.join(", ")}</Text>
              </>
            )}
            {budgetRange && (
              <>
                <Text style={label}>Budget</Text>
                <Text style={value}>{budgetRange}</Text>
              </>
            )}
            <Text style={label}>Message</Text>
            <Text style={{ ...value, whiteSpace: "pre-wrap" }}>{message}</Text>
            <Hr style={{ borderColor: "#e5e5e0", margin: "18px 0" }} />
            <Link href={adminUrl} style={btn}>
              Ouvrir dans l’administration
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default LeadNotification;
