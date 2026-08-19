"use client";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { reauthenticateAction } from "@/server/actions/reauth";

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
    <form onSubmit={submit} className="flex max-w-sm flex-col gap-3">
      <p className="text-sm text-[var(--dim)]">
        Confirmez votre mot de passe pour gérer les utilisateurs.
      </p>
      <label htmlFor="reauth" className="text-sm font-medium">
        Mot de passe
      </label>
      <input
        id="reauth"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-acc px-4 py-2 text-sm font-semibold text-on-acc disabled:opacity-60"
      >
        {pending ? "Vérification…" : "Confirmer"}
      </button>
      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-red-600">
        {error}
      </p>
    </form>
  );
}
