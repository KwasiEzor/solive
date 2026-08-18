"use client";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAction, verifyTotpAction } from "@/server/actions/auth";

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
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Connexion</h1>

      {step === "login" ? (
        <form onSubmit={onLogin} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-acc px-4 py-2 font-semibold text-on-acc disabled:opacity-60"
          >
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
        <form onSubmit={onMfa} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="otp" className="text-sm font-medium">
              Code d’authentification (6 chiffres)
            </label>
            <input
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2 tracking-widest"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-acc px-4 py-2 font-semibold text-on-acc disabled:opacity-60"
          >
            {pending ? "Vérification…" : "Valider"}
          </button>
        </form>
      )}

      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-red-600">
        {error}
      </p>
    </div>
  );
}
