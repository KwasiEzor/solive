"use client";
import {
  BarChart3,
  Boxes,
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  LayoutPanelTop,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { signOutAction } from "@/server/actions/auth";
import { Mark } from "@/components/site/icons";
import { AdminLangSwitch } from "./admin-lang-switch";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { SiteLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";

type Item = { href: string; label: string; icon: LucideIcon; match?: string };

function groupsFor(t: Dictionary["admin"]): { label: string; items: Item[] }[] {
  return [
    {
      label: t.nav.groups.pilotage,
      items: [
        { href: "/admin", label: t.nav.items.dashboard, icon: LayoutDashboard },
        {
          href: "/admin/statistiques",
          label: t.nav.items.statistiques,
          icon: BarChart3,
          match: "/admin/statistiques",
        },
      ],
    },
    {
      label: t.nav.groups.contenu,
      items: [
        {
          href: "/admin/contenu/hero",
          label: t.nav.items.sections,
          icon: LayoutPanelTop,
          match: "/admin/contenu",
        },
        {
          href: "/admin/collections",
          label: t.nav.items.collections,
          icon: Boxes,
          match: "/admin/collections",
        },
        {
          href: "/admin/legal",
          label: t.nav.items.confidentialite,
          icon: ShieldCheck,
          match: "/admin/legal",
        },
      ],
    },
    {
      label: t.nav.groups.relationClient,
      items: [
        {
          href: "/admin/demandes",
          label: t.nav.items.demandes,
          icon: Inbox,
          match: "/admin/demandes",
        },
        {
          href: "/admin/devis",
          label: t.nav.items.devis,
          icon: FileText,
          match: "/admin/devis",
        },
      ],
    },
    {
      label: t.nav.groups.systeme,
      items: [
        {
          href: "/admin/parametres",
          label: t.nav.items.parametres,
          icon: Settings,
          match: "/admin/parametres",
        },
        {
          href: "/admin/utilisateurs",
          label: t.nav.items.utilisateurs,
          icon: Users,
          match: "/admin/utilisateurs",
        },
        {
          href: "/admin/journal",
          label: t.nav.items.journal,
          icon: ScrollText,
          match: "/admin/journal",
        },
        {
          href: "/admin/profil",
          label: t.nav.items.profil,
          icon: UserCircle,
          match: "/admin/profil",
        },
      ],
    },
  ];
}

function isActive(pathname: string, it: Item) {
  return it.match ? pathname.startsWith(it.match) : pathname === it.href;
}

export function AdminShell({
  email,
  role,
  locale,
  t,
  children,
}: {
  email: string;
  role: string;
  locale: SiteLocale;
  t: Dictionary["admin"];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initials = email.slice(0, 2).toUpperCase();
  const GROUPS = groupsFor(t);
  const ALL = GROUPS.flatMap((g) => g.items);
  const title = ALL.find((it) => isActive(pathname, it))?.label ?? t.topbar.defaultTitle;
  const roleLabel = role === "owner" ? t.account.roleOwner : t.account.roleEditor;

  return (
    <div className="admin min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {open && (
        <button
          type="button"
          aria-label={t.topbar.closeMenu}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--line)] bg-[var(--bg2)] transition-transform lg:translate-x-0" +
          (open ? " translate-x-0" : " -translate-x-full")
        }
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-[var(--line)] px-5">
          <span className="text-acc">
            <Mark size={22} />
          </span>
          <span className="font-extrabold tracking-tight">Solive</span>
          <span className="ml-1 rounded bg-[var(--bg3)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--dim)]">
            {t.brandBadge}
          </span>
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label={t.nav.aria}
        >
          {GROUPS.map((g) => (
            <div key={g.label} className="mb-5">
              <p className="mb-1.5 px-2 font-mono text-[10px] uppercase tracking-widest text-[var(--dim)]">
                {g.label}
              </p>
              <ul className="flex flex-col gap-0.5">
                {g.items.map((it) => {
                  const active = isActive(pathname, it);
                  const Icon = it.icon;
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={
                          "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors " +
                          (active
                            ? "bg-[color-mix(in_srgb,var(--acc)_14%,transparent)] font-semibold text-acc"
                            : "text-[var(--fg)] hover:bg-[var(--bg3)]")
                        }
                      >
                        <Icon
                          size={17}
                          className={active ? "text-acc" : "text-[var(--dim)]"}
                        />
                        {it.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--line)] p-3">
          <div className="mb-2 flex items-center gap-2.5 px-1">
            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-gradient-to-b from-[var(--acc)] to-[var(--acc-strong)] font-mono text-xs font-bold text-[var(--on-acc)]">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium">{email}</span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--dim)]">
                {roleLabel}
              </span>
            </span>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-[var(--dim)] transition-colors hover:bg-[var(--bg3)] hover:text-[var(--fg)]"
            >
              <LogOut size={16} /> {t.account.signOut}
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] px-4 backdrop-blur lg:px-8">
          <button
            type="button"
            aria-label={t.topbar.openMenu}
            onClick={() => setOpen(true)}
            className="rounded-lg p-1.5 hover:bg-[var(--bg3)] lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-sm font-semibold">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <AdminLangSwitch
              locale={locale}
              className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs font-semibold text-[var(--dim)] transition-colors hover:border-acc hover:text-[var(--fg)]"
            />
            <Link
              href={localizedPath("/", locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs text-[var(--dim)] transition-colors hover:border-acc hover:text-[var(--fg)]"
            >
              {t.topbar.viewSite} <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
