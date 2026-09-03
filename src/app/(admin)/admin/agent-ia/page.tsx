import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import {
  clearAgentCredentialAction,
  updateAgentConfigAction,
  updateAgentCredentialsAction,
} from "@/server/actions/agent-settings";
import { getCurrentAdmin } from "@/server/auth/guards";
import { getAgentSettingsForAdmin } from "@/server/queries/admin";
import { secretsConfigured } from "@/server/services/secrets";

export const metadata: Metadata = {
  title: "Agent IA",
  robots: { index: false, follow: false },
};

const MODELS = [
  ["claude-haiku-4-5", "Haiku — rapide, économique (recommandé)"],
  ["claude-sonnet-4-5", "Sonnet — plus capable, plus cher"],
] as const;

export default async function AgentIaPage() {
  const admin = await getCurrentAdmin();
  if (!admin.ok) redirect("/connexion");
  if (admin.value.role !== "owner") redirect("/admin");

  const settings = await getAgentSettingsForAdmin();
  const canEncrypt = secretsConfigured();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Agent IA"
        description="Assistant de qualification affiché en bouton flottant sur le site public."
      />

      {!canEncrypt && (
        <div className="adm-card adm-card-p border-[#ef6b6b] text-sm">
          <p className="font-bold text-[#ef6b6b]">Chiffrement non configuré</p>
          <p className="mt-1 text-[var(--dim)]">
            La variable <code>SETTINGS_ENCRYPTION_KEY</code> est absente ou
            invalide. Générez-en une (<code>openssl rand -base64 32</code>) et
            ajoutez-la à <code>.env.local</code> et à Vercel avant
            d’enregistrer une clé ici. En attendant, l’agent continue de lire
            <code> ANTHROPIC_API_KEY</code>/<code>ANTHROPIC_WORKSPACE_ID</code>{" "}
            depuis les variables d’environnement.
          </p>
        </div>
      )}

      <section className="adm-card adm-card-p flex flex-col gap-3">
        <div>
          <h2 className="font-bold">Activation &amp; modèle</h2>
          <p className="text-sm text-[var(--dim)]">
            Désactiver masque le bouton flottant sur tout le site, immédiatement.
          </p>
        </div>
        <form action={updateAgentConfigAction} className="flex flex-col gap-4">
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              name="enabled"
              value="1"
              defaultChecked={settings?.enabled ?? true}
              className="h-4 w-4 accent-[var(--acc)]"
            />
            <span className="text-sm font-medium">Agent activé</span>
          </label>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="model" className="text-sm font-medium">
              Modèle
            </label>
            <select
              id="model"
              name="model"
              defaultValue={settings?.model ?? "claude-haiku-4-5"}
              className="adm-select"
            >
              {MODELS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="instructionsFr" className="text-sm font-medium">
              Consignes (FR)
            </label>
            <textarea
              id="instructionsFr"
              name="instructionsFr"
              rows={6}
              defaultValue={settings?.instructionsFr ?? ""}
              placeholder="Vide = consignes par défaut. Le contenu réel du site (services, tarifs, FAQ) est toujours ajouté après, quoi qu’il arrive."
              className="adm-input font-mono text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="instructionsEn" className="text-sm font-medium">
              Consignes (EN)
            </label>
            <textarea
              id="instructionsEn"
              name="instructionsEn"
              rows={6}
              defaultValue={settings?.instructionsEn ?? ""}
              placeholder="Blank = default instructions. Real site content (services, pricing, FAQ) is always appended after, regardless."
              className="adm-input font-mono text-xs"
            />
          </div>

          <button type="submit" className="adm-btn adm-btn-primary self-start text-sm">
            Enregistrer
          </button>
        </form>
      </section>

      <section className="adm-card adm-card-p flex flex-col gap-3">
        <div>
          <h2 className="font-bold">Identifiants Anthropic</h2>
          <p className="text-sm text-[var(--dim)]">
            Chiffrés en base, jamais réaffichés en clair. Un champ laissé vide
            ne change pas la valeur enregistrée. Si rien n’est configuré ici,
            <code> ANTHROPIC_API_KEY</code>/<code>ANTHROPIC_WORKSPACE_ID</code>{" "}
            (variables d’environnement) servent de repli.
          </p>
        </div>
        <form action={updateAgentCredentialsAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="apiKey" className="text-sm font-medium">
              Clé API Anthropic
            </label>
            <input
              id="apiKey"
              name="apiKey"
              type="password"
              autoComplete="off"
              disabled={!canEncrypt}
              placeholder={
                settings?.hasApiKey
                  ? `•••• se termine par ${settings.apiKeyLast4}`
                  : "sk-ant-…"
              }
              className="adm-input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="workspaceId" className="text-sm font-medium">
              Workspace ID (si clé identity-linked)
            </label>
            <input
              id="workspaceId"
              name="workspaceId"
              type="password"
              autoComplete="off"
              disabled={!canEncrypt}
              placeholder={
                settings?.hasWorkspaceId
                  ? `•••• se termine par ${settings.workspaceIdLast4}`
                  : "wrkspc_…"
              }
              className="adm-input"
            />
          </div>
          <button
            type="submit"
            disabled={!canEncrypt}
            className="adm-btn adm-btn-primary self-start text-sm"
          >
            Enregistrer les identifiants
          </button>
        </form>

        {(settings?.hasApiKey || settings?.hasWorkspaceId) && (
          <div className="flex flex-wrap gap-2 border-t border-[var(--line)] pt-3">
            {settings?.hasApiKey && (
              <form action={clearAgentCredentialAction}>
                <input type="hidden" name="field" value="apiKey" />
                <button type="submit" className="adm-btn adm-btn-ghost text-xs">
                  Retirer la clé API
                </button>
              </form>
            )}
            {settings?.hasWorkspaceId && (
              <form action={clearAgentCredentialAction}>
                <input type="hidden" name="field" value="workspaceId" />
                <button type="submit" className="adm-btn adm-btn-ghost text-xs">
                  Retirer le workspace ID
                </button>
              </form>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
