"use client";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  requestPasswordResetAction,
  updatePasswordAction,
} from "@/server/actions/password";
import { PasswordField } from "./password-field";

const inputStyle = {
  border: "1px solid var(--line)",
  background: "var(--bg2)",
  color: "var(--fg)",
} as const;
const btnStyle = {
  background: "linear-gradient(180deg, var(--acc), var(--acc-strong))",
  color: "var(--on-acc)",
  boxShadow: "var(--shadow-sm)",
} as const;
const btnCls =
  "rounded-lg px-4 py-2.5 font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-60";

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
      <p role="status" className="text-sm" style={{ color: "var(--dim)" }}>
        Si un compte est associé à cette adresse, un e-mail avec un lien de
        réinitialisation vient d’être envoyé. Le lien expire après 30 minutes.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
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
          className="w-full rounded-lg px-3 py-2.5"
          style={inputStyle}
        />
      </div>
      <button type="submit" disabled={pending} className={btnCls} style={btnStyle}>
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
      <button type="submit" disabled={pending} className={btnCls} style={btnStyle}>
        {pending ? "Enregistrement…" : "Définir le mot de passe"}
      </button>
      <p
        role="alert"
        aria-live="polite"
        className="min-h-5 text-sm"
        style={{ color: "#f87171" }}
      >
        {error}
      </p>
    </form>
  );
}
