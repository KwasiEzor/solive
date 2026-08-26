import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { ProfileEditor } from "@/components/admin/profile-editor";
import { getAdminLocale } from "@/lib/i18n/admin-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getCurrentAdmin } from "@/server/auth/guards";
import { getAdminProfile } from "@/server/queries/admin";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getAdminLocale();
  return {
    title: getDictionary(locale).admin.profile.title,
    robots: { index: false, follow: false },
  };
}

function fmt(ts: Date | null, locale: "fr" | "en"): string | null {
  if (!ts) return null;
  return ts.toLocaleString(locale === "en" ? "en-GB" : "fr-BE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function ProfilePage() {
  const admin = await getCurrentAdmin();
  if (!admin.ok) redirect("/connexion");

  const locale = await getAdminLocale();
  const t = getDictionary(locale).admin.profile;
  const profile = await getAdminProfile(admin.value.userId);
  if (!profile) redirect("/connexion");

  const roleLabel =
    profile.role === "owner"
      ? getDictionary(locale).admin.account.roleOwner
      : getDictionary(locale).admin.account.roleEditor;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.title} />

      <section className="adm-card adm-card-p flex flex-col gap-4">
        <h2 className="font-bold">{t.accountHeading}</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[var(--dim)]">{t.emailLabel}</dt>
            <dd className="font-medium">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--dim)]">{t.roleLabel}</dt>
            <dd className="font-medium">{roleLabel}</dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--dim)]">{t.mfaLabel}</dt>
            <dd className="font-medium">
              {profile.mfaEnrolledAt ? t.mfaEnabled : t.mfaDisabled}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--dim)]">{t.lastSeenLabel}</dt>
            <dd className="font-medium">{fmt(profile.lastSeenAt, locale) ?? t.never}</dd>
          </div>
        </dl>
      </section>

      <ProfileEditor
        fullName={profile.fullName ?? ""}
        locale={locale}
        t={t}
      />
    </div>
  );
}
