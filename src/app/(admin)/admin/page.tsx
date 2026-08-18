import type { Metadata } from "next";
import { getCurrentAdmin } from "@/server/auth/guards";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false, follow: false },
};

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin();
  const email = admin.ok ? admin.value.email : "";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Tableau de bord</h1>
      <p className="text-[var(--dim)]">
        Connecté en tant que <strong>{email}</strong>. Les modules (demandes,
        contenu, médias) arrivent en phase 5.
      </p>
    </div>
  );
}
