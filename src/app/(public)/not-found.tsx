import Link from "next/link";
import { PageHeader } from "@/components/site/subpage";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";

/**
 * Branded 404 for the public route tree — rendered inside (public)/layout.tsx
 * (Nav/Footer/palette wrapper), so it looks like the rest of the site rather
 * than Next's default. A miss outside (public)/(admin) (rare — connexion,
 * mfa, etc. are standalone) falls through to the framework default instead.
 */
export default async function PublicNotFound() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).notFound;

  return (
    <>
      <PageHeader kicker={t.kicker} title={t.title} lede={t.lede} />
      <section className="sec">
        <div className="wrap narrow">
          <Link href={localizedPath("/", locale)} className="btn">
            {t.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
