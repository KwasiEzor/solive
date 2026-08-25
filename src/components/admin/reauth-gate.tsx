"use client";
import { AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { reauthenticateAction } from "@/server/actions/reauth";
import { PasswordField } from "./password-field";

/** Password re-check before sensitive operations (SLV-047). */
export function ReauthGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const r = await reauthenticateAction({ password });
    setPending(false);
    if (r.status === "ok") router.refresh();
    else setError(r.message);
  }

  return (
    <form
      onSubmit={submit}
      className="adm-card adm-card-p flex max-w-sm flex-col gap-4"
    >
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-[color-mix(in_srgb,var(--acc)_14%,transparent)] text-acc">
          <ShieldAlert size={18} />
        </span>
        <p className="text-sm text-[var(--dim)]">
          Confirmez votre mot de passe pour gérer les utilisateurs.
        </p>
      </div>
      <PasswordField
        id="reauth"
        label="Mot de passe"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />
      <button
        type="submit"
        disabled={pending}
        style={{ width: "auto" }}
        className="auth-btn self-start px-5"
      >
        {pending && <Loader2 size={16} className="spin" />}
        {pending ? "Vérification…" : "Confirmer"}
      </button>
      {error && (
        <p role="alert" aria-live="polite" className="auth-error">
          <AlertCircle size={15} className="mt-px flex-none" />
          <span>{error}</span>
        </p>
      )}
    </form>
  );
}
