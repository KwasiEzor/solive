"use client";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  requestPasswordResetAction,
  updatePasswordAction,
} from "@/server/actions/password";
import { PasswordField } from "./password-field";

export function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    await requestPasswordResetAction({ email });
    setPending(false);
    setDone(true);
  }

  if (done) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg2)] p-4 text-sm text-[var(--dim)]"
      >
        <MailCheck size={18} className="mt-0.5 flex-none text-acc" />
        <span>
          Si un compte est associé à cette adresse, un e-mail avec un lien de
          réinitialisation vient d’être envoyé. Le lien expire après 30 minutes.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="auth-label">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          required
          placeholder="vous@solive.pro"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />
      </div>
      <button type="submit" disabled={pending} className="auth-btn">
        {pending && <Loader2 size={16} className="spin" />}
        {pending ? "Envoi…" : "Envoyer le lien"}
      </button>
    </form>
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
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <PasswordField
        id="password"
        label="Nouveau mot de passe (12 caractères minimum)"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        showStrength
      />
      <button type="submit" disabled={pending} className="auth-btn">
        {pending && <Loader2 size={16} className="spin" />}
        {pending ? "Enregistrement…" : "Définir le mot de passe"}
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
