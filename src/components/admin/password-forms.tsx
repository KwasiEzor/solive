"use client";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  requestPasswordResetAction,
  updatePasswordAction,
} from "@/server/actions/password";

const inputCls =
  "rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2";
const btnCls =
  "rounded bg-acc px-4 py-2 font-semibold text-on-acc disabled:opacity-60";

export function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    await requestPasswordResetAction({ email });
    setPending(false);
    setDone(true); // always generic (no enumeration)
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-extrabold tracking-tight">
        Mot de passe oublié
      </h1>
      {done ? (
        <p role="status" className="text-sm text-[var(--dim)]">
          Si un compte est associé à cette adresse, un e-mail avec un lien de
          réinitialisation vient d’être envoyé. Le lien expire après 30 minutes.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
          <button type="submit" disabled={pending} className={btnCls}>
            {pending ? "Envoi…" : "Envoyer le lien"}
          </button>
        </form>
      )}
    </div>
  );
}

export function SetNewPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const r = await updatePasswordAction({ password });
    setPending(false);
    if (r.status === "ok") router.push("/connexion?reset=1");
    else setError(r.message);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-extrabold tracking-tight">
        Nouveau mot de passe
      </h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <label htmlFor="password" className="text-sm font-medium">
          Mot de passe (12 caractères minimum)
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
        <button type="submit" disabled={pending} className={btnCls}>
          {pending ? "Enregistrement…" : "Définir le mot de passe"}
        </button>
      </form>
      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-red-600">
        {error}
      </p>
    </div>
  );
}
