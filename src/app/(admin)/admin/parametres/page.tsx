import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClearCacheButton } from "@/components/admin/clear-cache";
import { PageHeader } from "@/components/admin/ui";
import {
  updateCompanyInfoAction,
  updatePaletteAction,
  updateVisibilityAction,
} from "@/server/actions/settings";
import {
  revokeOtherSessionsAction,
  revokeSessionAction,
} from "@/server/actions/sessions";
import { getCurrentAdmin } from "@/server/auth/guards";
import { getSiteSettings } from "@/server/queries/content";
import { listUserSessions } from "@/server/services/sessions";

const PALETTES = [
  ["chaux", "Chaux (clair)"],
  ["ardoise", "Ardoise (sombre)"],
  ["cobalt", "Cobalt (bleu)"],
] as const;

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false, follow: false },
};

function fmt(ts: string | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("fr-BE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function SettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin.ok) redirect("/connexion");
  const sessions = await listUserSessions(admin.value.userId);
  const settings = await getSiteSettings();
  const isOwner = admin.value.role === "owner";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Paramètres"
        description="Apparence du site, sessions et cache local."
      />

      <section className="adm-card adm-card-p flex flex-col gap-3">
        <div>
          <h2 className="font-bold">Cache local (PWA)</h2>
          <p className="text-sm text-[var(--dim)]">
            Vide le cache hors-ligne, la file d’attente et le service worker sur
            cet appareil.
          </p>
        </div>
        <ClearCacheButton />
      </section>

      {isOwner && (
        <section className="adm-card adm-card-p flex flex-col gap-3">
          <div>
            <h2 className="font-bold">Coordonnées de l’entreprise</h2>
            <p className="text-sm text-[var(--dim)]">
              Affichées sur les devis générés (en-tête du PDF).
            </p>
          </div>
          <form
            action={updateCompanyInfoAction}
            className="grid gap-3 sm:grid-cols-2"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Nom
              </label>
              <input
                id="name"
                name="name"
                defaultValue={settings?.name ?? ""}
                required
                className="adm-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="baseline" className="text-sm font-medium">
                Baseline
              </label>
              <input
                id="baseline"
                name="baseline"
                defaultValue={settings?.baseline ?? ""}
                className="adm-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={settings?.email ?? ""}
                className="adm-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium">
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                defaultValue={settings?.phone ?? ""}
                className="adm-input"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="address" className="text-sm font-medium">
                Adresse
              </label>
              <input
                id="address"
                name="address"
                defaultValue={settings?.address ?? ""}
                className="adm-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="vat" className="text-sm font-medium">
                N° TVA
              </label>
              <input
                id="vat"
                name="vat"
                defaultValue={settings?.vat ?? ""}
                className="adm-input"
              />
            </div>
            <button
              type="submit"
              className="adm-btn adm-btn-primary self-end text-sm"
            >
              Enregistrer
            </button>
          </form>
        </section>
      )}

      {isOwner && (
        <section className="adm-card adm-card-p flex flex-col gap-3">
          <div>
            <h2 className="font-bold">Palette du site</h2>
            <p className="text-sm text-[var(--dim)]">
              Appliquée à la vitrine sans redéploiement.
            </p>
          </div>
          <form action={updatePaletteAction} className="flex items-end gap-2">
            <label htmlFor="palette" className="sr-only">
              Palette
            </label>
            <select
              id="palette"
              name="palette"
              defaultValue={settings?.activePalette ?? "chaux"}
              className="adm-select"
            >
              {PALETTES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button type="submit" className="adm-btn adm-btn-primary">
              Appliquer
            </button>
          </form>
        </section>
      )}

      {isOwner && (
        <section className="adm-card adm-card-p flex flex-col gap-3">
          <div>
            <h2 className="font-bold">Boutons flottants</h2>
            <p className="text-sm text-[var(--dim)]">
              Affichés sur la vitrine publique, en bas de l’écran.
            </p>
          </div>
          <form action={updateVisibilityAction} className="flex flex-col gap-2.5">
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                name="showFloatCta"
                value="1"
                defaultChecked={settings?.showFloatCta ?? true}
                className="h-4 w-4 accent-[var(--acc)]"
              />
              <span className="text-sm font-medium">CTA flottant</span>
              <span className="text-xs text-[var(--dim)]">
                — « Prendre 20 minutes », en bas à droite
              </span>
            </label>
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                name="showThemeSwitcher"
                value="1"
                defaultChecked={settings?.showThemeSwitcher ?? true}
                className="h-4 w-4 accent-[var(--acc)]"
              />
              <span className="text-sm font-medium">Sélecteur de palette</span>
              <span className="text-xs text-[var(--dim)]">
                — laisse les visiteurs choisir leur propre palette, en bas à gauche
              </span>
            </label>
            <button
              type="submit"
              className="adm-btn adm-btn-primary self-start text-sm"
            >
              Enregistrer
            </button>
          </form>
        </section>
      )}

      <section className="adm-card adm-card-p flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Sessions actives</h2>
          <form action={revokeOtherSessionsAction}>
            <button type="submit" className="adm-btn adm-btn-ghost text-sm">
              Révoquer les autres
            </button>
          </form>
        </div>
        <div className="-mx-5 -mb-5 overflow-x-auto">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Appareil</th>
                <th>IP</th>
                <th>Dernière activité</th>
                <th>Niveau</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td className="max-w-xs truncate">{s.userAgent ?? "Inconnu"}</td>
                  <td className="text-[var(--dim)]">{s.ip ?? "—"}</td>
                  <td className="text-[var(--dim)]">
                    {fmt(s.updatedAt ?? s.createdAt)}
                  </td>
                  <td>{s.aal ?? "—"}</td>
                  <td className="text-right">
                    <form action={revokeSessionAction}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <button type="submit" className="adm-icon-btn danger px-3 text-xs">
                        Révoquer
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-[var(--dim)]">
                    Aucune session listée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
