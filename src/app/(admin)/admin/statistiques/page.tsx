import { Eye, Globe, Megaphone, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { type AnalyticsData, getAnalytics } from "@/server/queries/analytics";

export const metadata: Metadata = {
  title: "Statistiques",
  robots: { index: false, follow: false },
};

const RANGES = [
  [7, "7 jours"],
  [30, "30 jours"],
  [90, "90 jours"],
] as const;

const regionNames = new Intl.DisplayNames(["fr"], { type: "region" });
function countryName(cc: string | null) {
  if (!cc) return "Inconnu";
  try {
    return regionNames.of(cc.toUpperCase()) ?? cc;
  } catch {
    return cc;
  }
}
function flag(cc: string | null) {
  if (!cc || cc.length !== 2) return "🏳️";
  return String.fromCodePoint(
    ...[...cc.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
const DEVICE_LABEL: Record<string, string> = {
  mobile: "Mobile",
  desktop: "Ordinateur",
  tablet: "Tablette",
};

function Kpi({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Eye;
  accent?: boolean;
}) {
  return (
    <div className="adm-card p-5">
      <span
        className={
          "mb-4 grid h-9 w-9 place-items-center rounded-lg " +
          (accent
            ? "bg-[color-mix(in_srgb,var(--acc)_16%,transparent)] text-acc"
            : "bg-[var(--bg3)] text-[var(--dim)]")
        }
      >
        <Icon size={18} />
      </span>
      <p className="truncate text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-[var(--dim)]">{label}</p>
    </div>
  );
}

function BarList({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="adm-card p-5">
      <h2 className="mb-3 font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--dim)]">Pas encore de données.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-3 text-sm">
              <span className="w-40 flex-none truncate" title={r.label}>
                {r.label}
              </span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg3)]">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-acc"
                  style={{ width: `${Math.max(3, (r.value / max) * 100)}%` }}
                />
              </span>
              <span className="w-10 flex-none text-right font-medium tabular-nums">
                {r.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: dRaw } = await searchParams;
  const days = [7, 30, 90].includes(Number(dRaw)) ? Number(dRaw) : 30;
  const a: AnalyticsData = await getAnalytics(days);

  const topCountry = a.byCountry.find((c) => c.country)?.country ?? null;
  const topCampaign = a.byCampaign[0];
  const maxDay = Math.max(1, ...a.byDay.map((d) => d.views));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Statistiques"
        description="Audience anonyme, sans cookie ni donnée personnelle. Pour mesurer l’impact de vos campagnes."
      >
        <nav className="flex gap-1" aria-label="Période">
          {RANGES.map(([d, label]) => (
            <Link
              key={d}
              href={`/admin/statistiques?days=${d}`}
              className={
                "rounded-full border px-3 py-1.5 text-sm transition-colors " +
                (days === d
                  ? "border-acc bg-[color-mix(in_srgb,var(--acc)_12%,transparent)] text-acc"
                  : "border-[var(--line)] text-[var(--dim)] hover:border-acc")
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Visiteurs uniques" value={String(a.totals.visitors)} icon={Users} accent />
        <Kpi label="Pages vues" value={String(a.totals.views)} icon={Eye} />
        <Kpi
          label="Pays en tête"
          value={topCountry ? `${flag(topCountry)} ${countryName(topCountry)}` : "—"}
          icon={Globe}
        />
        <Kpi
          label="Campagne en tête"
          value={topCampaign?.campaign ?? topCampaign?.source ?? "—"}
          icon={Megaphone}
        />
      </div>

      <div className="adm-card p-5">
        <h2 className="mb-4 font-bold">Pages vues par jour</h2>
        {a.byDay.length === 0 ? (
          <p className="text-sm text-[var(--dim)]">
            Aucune visite mesurée sur la période. Les données apparaîtront dès
            que le site recevra du trafic.
          </p>
        ) : (
          <div className="flex h-36 items-end gap-1">
            {a.byDay.map((d) => (
              <div
                key={d.day}
                title={`${d.day} · ${d.views} vues · ${d.visitors} visiteurs`}
                className="min-w-0 flex-1 rounded-t bg-[color-mix(in_srgb,var(--acc)_75%,transparent)] transition-colors hover:bg-acc"
                style={{ height: `${Math.max(3, (d.views / maxDay) * 100)}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Campagnes — le cœur de la mesure publicitaire */}
      <div className="adm-card overflow-x-auto">
        <h2 className="px-5 pt-5 font-bold">Campagnes (UTM)</h2>
        <table className="adm-table mt-3">
          <thead>
            <tr>
              <th>Source</th>
              <th>Support</th>
              <th>Campagne</th>
              <th className="text-right">Visiteurs</th>
              <th className="text-right">Vues</th>
            </tr>
          </thead>
          <tbody>
            {a.byCampaign.map((c, i) => (
              <tr key={i}>
                <td className="font-medium">{c.source ?? "—"}</td>
                <td className="text-[var(--dim)]">{c.medium ?? "—"}</td>
                <td>{c.campaign ?? "—"}</td>
                <td className="text-right tabular-nums">{c.visitors}</td>
                <td className="text-right tabular-nums">{c.views}</td>
              </tr>
            ))}
            {a.byCampaign.length === 0 && (
              <tr>
                <td colSpan={5} className="text-[var(--dim)]">
                  Aucune campagne balisée (paramètres <code>utm_*</code>) sur la
                  période.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <BarList
          title="Pays"
          rows={a.byCountry.map((c) => ({
            label: `${flag(c.country)} ${countryName(c.country)}`,
            value: c.views,
          }))}
        />
        <BarList
          title="Pages"
          rows={a.byPage.map((p) => ({ label: p.path, value: p.views }))}
        />
        <BarList
          title="Référents"
          rows={a.byReferrer.map((r) => ({
            label: r.host ?? "direct",
            value: r.views,
          }))}
        />
        <BarList
          title="Appareils"
          rows={a.byDevice.map((d) => ({
            label: DEVICE_LABEL[d.device ?? ""] ?? d.device ?? "Inconnu",
            value: d.views,
          }))}
        />
      </div>
    </div>
  );
}
