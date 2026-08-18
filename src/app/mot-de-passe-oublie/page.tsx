import type { Metadata } from "next";
import { RequestResetForm } from "@/components/admin/password-forms";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <RequestResetForm />;
}
