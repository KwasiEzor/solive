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
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { signOutAction } from "@/server/actions/auth";
import { Mark } from "@/components/site/icons";

type Item = { href: string; label: string; icon: LucideIcon; match?: string };

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Pilotage",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
      {
        href: "/admin/statistiques",
        label: "Statistiques",
        icon: BarChart3,
        match: "/admin/statistiques",
      },
    ],
  },
  {
    label: "Contenu",
    items: [
      {
        href: "/admin/contenu/hero",
        label: "Sections",
        icon: LayoutPanelTop,
        match: "/admin/contenu",
      },
      {
        href: "/admin/collections",
        label: "Collections",
        icon: Boxes,
        match: "/admin/collections",
      },
    ],
  },
  {
    label: "Relation client",
    items: [
      {
        href: "/admin/demandes",
        label: "Demandes",
        icon: Inbox,
        match: "/admin/demandes",
      },
      {
        href: "/admin/devis",
        label: "Devis",
        icon: FileText,
        match: "/admin/devis",
      },
    ],
  },
  {
    label: "Système",
    items: [
      {
        href: "/admin/parametres",
        label: "Paramètres",
        icon: Settings,
        match: "/admin/parametres",
      },
      {
        href: "/admin/utilisateurs",
        label: "Utilisateurs",
        icon: Users,
        match: "/admin/utilisateurs",
      },
      {
        href: "/admin/journal",
        label: "Journal",
        icon: ScrollText,
        match: "/admin/journal",
      },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.items);

function isActive(pathname: string, it: Item) {
  return it.match ? pathname.startsWith(it.match) : pathname === it.href;
}

function titleFor(pathname: string) {
  const hit = ALL.find((it) => isActive(pathname, it));
  return hit?.label ?? "Administration";
}

export function AdminShell({
  email,
  role,
  children,
}: {
  email: string;
  role: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="admin min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
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
            Admin
          </span>
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Navigation admin"
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
                {role}
              </span>
            </span>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-[var(--dim)] transition-colors hover:bg-[var(--bg3)] hover:text-[var(--fg)]"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] px-4 backdrop-blur lg:px-8">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen(true)}
            className="rounded-lg p-1.5 hover:bg-[var(--bg3)] lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-sm font-semibold">{titleFor(pathname)}</h1>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs text-[var(--dim)] transition-colors hover:border-acc hover:text-[var(--fg)]"
          >
            Voir le site <ExternalLink size={13} />
          </Link>
        </header>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
