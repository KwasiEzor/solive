import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LegalPageEditor } from "@/components/admin/legal-page-editor";
import { getAdminLocale } from "@/lib/i18n/admin-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getCurrentAdmin } from "@/server/auth/guards";
import { getLegalPageForEdit } from "@/server/queries/admin";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getAdminLocale();
  return {
    title: getDictionary(locale).admin.legalEditor.title,
    robots: { index: false, follow: false },
  };
}

export default async function LegalEditorPage() {
  const admin = await getCurrentAdmin();
  if (!admin.ok) redirect("/connexion");

  const locale = await getAdminLocale();
  const t = getDictionary(locale).admin.legalEditor;

  const [frIntroRow, frSuiteRow, enIntroRow, enSuiteRow] = await Promise.all([
    getLegalPageForEdit("confidentialite", "fr"),
    getLegalPageForEdit("confidentialite-suite", "fr"),
    getLegalPageForEdit("confidentialite", "en"),
    getLegalPageForEdit("confidentialite-suite", "en"),
  ]);
  if (!frIntroRow || !frSuiteRow || !enIntroRow || !enSuiteRow) notFound();

  return (
    <LegalPageEditor
      frIntro={{ id: frIntroRow.id, body: frIntroRow.body, updatedAt: frIntroRow.updatedAt.toISOString() }}
      frSuite={{ id: frSuiteRow.id, body: frSuiteRow.body, updatedAt: frSuiteRow.updatedAt.toISOString() }}
      enIntro={{ id: enIntroRow.id, body: enIntroRow.body, updatedAt: enIntroRow.updatedAt.toISOString() }}
      enSuite={{ id: enSuiteRow.id, body: enSuiteRow.body, updatedAt: enSuiteRow.updatedAt.toISOString() }}
      t={t}
    />
  );
}
