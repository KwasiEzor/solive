"use client";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { loginAction, verifyTotpAction } from "@/server/actions/auth";
import { PasswordField } from "./password-field";

const inputCls = "w-full rounded-lg px-3 py-2.5";
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

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "mfa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const r = await loginAction({ email, password });
    setPending(false);
    if (r.status === "ok") router.push("/admin");
    else if (r.status === "mfa_required") setStep("mfa");
    else if (r.status === "mfa_enroll") router.push("/mfa");
    else if (r.status === "throttled")
      setError(`Trop de tentatives. Réessayez dans ${r.retryAfterSec} s.`);
    else setError(r.message);
  }

  async function onMfa(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const r = await verifyTotpAction({ code });
    setPending(false);
    if (r.status === "ok") router.push("/admin");
    else setError(r.status === "error" ? r.message : "Erreur.");
  }

  return (
    <div className="flex flex-col gap-5">
      {step === "login" ? (
        <form onSubmit={onLogin} className="flex flex-col gap-4" noValidate>
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
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <PasswordField
            id="password"
            label="Mot de passe"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg px-4 py-2.5 font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            style={btnStyle}
          >
            {pending ? "Connexion…" : "Se connecter"}
          </button>
          <a
            href="/mot-de-passe-oublie"
            className="text-sm underline underline-offset-2"
            style={{ color: "var(--dim)" }}
          >
            Mot de passe oublié ?
          </a>
        </form>
      ) : (
        <form onSubmit={onMfa} className="flex flex-col gap-4" noValidate>
          <p className="text-sm" style={{ color: "var(--dim)" }}>
            Entrez le code à 6 chiffres de votre application d’authentification.
          </p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="otp" className="text-sm font-medium">
              Code d’authentification
            </label>
            <input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${inputCls} tracking-[0.4em]`}
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg px-4 py-2.5 font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            style={btnStyle}
          >
            {pending ? "Vérification…" : "Valider"}
          </button>
        </form>
      )}

      <p
        role="alert"
        aria-live="polite"
        className="min-h-5 text-sm"
        style={{ color: "#f87171" }}
      >
        {error}
      </p>
    </div>
  );
}
