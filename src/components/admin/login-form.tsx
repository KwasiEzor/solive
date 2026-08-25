"use client";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { loginAction, verifyTotpAction } from "@/server/actions/auth";
import { OtpInput } from "./otp-input";
import { PasswordField } from "./password-field";

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

  async function verify(current: string) {
    setPending(true);
    setError("");
    const r = await verifyTotpAction({ code: current });
    setPending(false);
    if (r.status === "ok") router.push("/admin");
    else {
      setError(r.status === "error" ? r.message : "Erreur.");
      setCode("");
    }
  }

  // Auto-submit once the 6th digit is entered — best-practice OTP UX.
  const onCodeChange = (v: string) => {
    setCode(v);
    if (v.length === 6) void verify(v);
  };

  return (
    <div className="flex flex-col gap-5">
      {step === "login" ? (
        <form onSubmit={onLogin} className="flex flex-col gap-4" noValidate>
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
          <PasswordField
            id="password"
            label="Mot de passe"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          <button type="submit" disabled={pending} className="auth-btn">
            {pending && <Loader2 size={16} className="spin" />}
            {pending ? "Connexion…" : "Se connecter"}
          </button>
          <a
            href="/mot-de-passe-oublie"
            className="text-sm text-[var(--dim)] underline underline-offset-2 hover:text-acc"
          >
            Mot de passe oublié ?
          </a>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--dim)]">
            Entrez le code à 6 chiffres de votre application d’authentification.
          </p>
          <OtpInput
            value={code}
            onChange={onCodeChange}
            autoFocus
            disabled={pending}
          />
          <button
            type="button"
            onClick={() => void verify(code)}
            disabled={pending || code.length < 6}
            className="auth-btn"
          >
            {pending && <Loader2 size={16} className="spin" />}
            {pending ? "Vérification…" : "Valider"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("login");
              setCode("");
              setError("");
            }}
            className="flex items-center justify-center gap-1.5 text-sm text-[var(--dim)] hover:text-acc"
          >
            <ArrowLeft size={14} /> Revenir à la connexion
          </button>
        </div>
      )}

      {error && (
        <p role="alert" aria-live="polite" className="auth-error">
          <AlertCircle size={15} className="mt-px flex-none" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
