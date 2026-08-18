import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MfaEnrollForm } from "@/components/admin/mfa-enroll-form";
import { getCurrentAdmin } from "@/server/auth/guards";

export const metadata: Metadata = {
  title: "Authentification à deux facteurs",
  robots: { index: false, follow: false },
};

// Mandatory MFA enrollment page (SLV-041). Reachable only with a valid session;
// an unenrolled owner is sent here by the admin layout and can go nowhere else.
export default async function MfaPage() {
  const admin = await getCurrentAdmin();
  if (!admin.ok) redirect("/connexion");
  return <MfaEnrollForm />;
}
