import {
  ArrowUpRight,
  BadgeCheck,
  FilePen,
  Inbox,
  MailCheck,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { formatCentsEUR } from "@/lib/money";
import { getCurrentAdmin } from "@/server/auth/guards";
import { getDashboardStats, getFunnelStats } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false, follow: false },
};

const ACTION_LABEL: Record<string, string> = {
  create: "création",
  update: "modification",
  delete: "suppression",
  publish: "publication",
  unpublish: "dépublication",
  restore: "restauration",
  login: "connexion",
  invite: "invitation",
  role_change: "changement de rôle",
  reorder: "réordonnancement",
};

function fmt(ts: Date | string) {
  return new Date(ts).toLocaleString("fr-BE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

const STATUS_LABEL: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  quoted: "Devis envoyé",
  won: "Gagné",
  lost: "Perdu",
};

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function FunnelStage({
  label,
  value,
  max,
  rate,
}: {
  label: string;
  value: number;
  max: number;
  rate?: number;
}) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 3 : 0) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 flex-none text-xs text-[var(--dim)]">{label}</span>
      <div className="h-6 flex-1 overflow-hidden rounded bg-[var(--bg3)]">
        <div
          className="h-full rounded bg-[var(--acc)] transition-[width]"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-10 flex-none text-right text-sm font-semibold">{value}</span>
      <span className="w-10 flex-none text-right text-xs text-[var(--dim)]">
        {rate !== undefined ? pct(rate) : ""}
      </span>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-[var(--line)] bg-[var(--bg2)] p-5 transition-colors hover:border-acc"
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className={
            "grid h-9 w-9 place-items-center rounded-lg " +
            (accent
              ? "bg-[color-mix(in_srgb,var(--acc)_16%,transparent)] text-acc"
              : "bg-[var(--bg3)] text-[var(--dim)]")
          }
        >
          <Icon size={18} />
        </span>
        <ArrowUpRight
          size={16}
          className="text-[var(--dim)] opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
      <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-[var(--dim)]">{label}</p>
    </Link>
  );
}

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin();
  const [stats, funnel] = await Promise.all([
    getDashboardStats(),
    getFunnelStats(),
  ]);
  const funnelMax = Math.max(funnel.pageViews, 1);

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Bonjour{admin.ok ? `, ${admin.value.email?.split("@")[0]}` : ""}
        </h1>
        <p className="text-sm text-[var(--dim)]">
          Voici l’état de Solive en un coup d’œil.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Demandes non traitées"
          value={stats.newLeads}
          icon={Inbox}
          href="/admin/demandes"
          accent
        />
        <Kpi
          label="Demandes au total"
          value={stats.totalLeads}
          icon={MailCheck}
          href="/admin/demandes"
        />
        <Kpi
          label="Sections en brouillon"
          value={stats.drafts}
          icon={FilePen}
          href="/admin/contenu/hero"
        />
        <Kpi
          label="Sections publiées"
          value={stats.publishedSections}
          icon={BadgeCheck}
          href="/admin/contenu/hero"
        />
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg2)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Funnel — 30 derniers jours</h2>
            <span className="text-xs text-[var(--dim)]">
              CA signé : {formatCentsEUR(funnel.revenueAcceptedCents)}
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            <FunnelStage label="Visites" value={funnel.pageViews} max={funnelMax} />
            <FunnelStage
              label="Demandes"
              value={funnel.leads}
              max={funnelMax}
              rate={funnel.viewToLeadRate}
            />
            <FunnelStage
              label="Devis créés"
              value={funnel.quotesCreated}
              max={funnelMax}
              rate={funnel.leadToQuoteRate}
            />
            <FunnelStage
              label="Devis acceptés"
              value={funnel.quotesAccepted}
              max={funnelMax}
              rate={funnel.sentToAcceptedRate}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg2)] p-5">
          <h2 className="mb-3 font-bold">Pipeline — toutes les demandes</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {Object.entries(funnel.leadsByStatus).map(([status, n]) => (
              <li key={status} className="flex items-center justify-between">
                <span className="text-[var(--dim)]">
                  {STATUS_LABEL[status] ?? status}
                </span>
                <span className="font-semibold">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg2)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Dernières demandes</h2>
            <Link
              href="/admin/demandes"
              className="text-xs text-[var(--dim)] hover:text-acc"
            >
              Tout voir
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--line)] text-sm">
            {stats.recentLeads.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <Link
                  href={`/admin/demandes/${l.id}`}
                  className="min-w-0 truncate hover:text-acc"
                >
                  <span className="font-medium">{l.name}</span>
                  <span className="text-[var(--dim)]"> · {l.email}</span>
                </Link>
                <span className="flex-none text-xs text-[var(--dim)]">
                  {fmt(l.createdAt)}
                </span>
              </li>
            ))}
            {stats.recentLeads.length === 0 && (
              <li className="py-2.5 text-[var(--dim)]">Aucune demande.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--line)] bg-[var(--bg2)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Dernière activité</h2>
            <Link
              href="/admin/journal"
              className="text-xs text-[var(--dim)] hover:text-acc"
            >
              Journal
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--line)] text-sm">
            {stats.recentChanges.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium">
                    {ACTION_LABEL[a.action] ?? a.action}
                  </span>
                  <span className="text-[var(--dim)]"> · {a.entityType}</span>
                </span>
                <span className="flex-none text-xs text-[var(--dim)]">
                  {fmt(a.createdAt)}
                </span>
              </li>
            ))}
            {stats.recentChanges.length === 0 && (
              <li className="py-2.5 text-[var(--dim)]">Aucune activité.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
