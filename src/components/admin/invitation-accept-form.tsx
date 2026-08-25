"use client";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { acceptInvitationAction } from "@/server/actions/invitations";
import { PasswordField } from "./password-field";

export function InvitationAcceptForm({
  token,
  email,
  role,
}: {
  token: string;
  email: string;
  role: "owner" | "editor";
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const r = await acceptInvitationAction({ token, password, fullName });
    setPending(false);
    if (r.status === "ok") router.push("/admin");
    else setError(r.message);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--bg2)] px-4 py-3 text-sm">
        <p className="text-[var(--dim)]">Compte invité</p>
        <p className="font-medium">{email}</p>
        <p className="mt-0.5 text-xs text-[var(--dim)]">
          Rôle : {role === "owner" ? "Propriétaire" : "Éditeur"}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="auth-label">
          Nom complet <span className="text-[var(--dim)]">(facultatif)</span>
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          autoFocus
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="auth-input"
        />
      </div>

      <PasswordField
        id="password"
        label="Choisir un mot de passe (12 caractères minimum)"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        showStrength
      />

      <button type="submit" disabled={pending} className="auth-btn">
        {pending && <Loader2 size={16} className="spin" />}
        {pending ? "Création du compte…" : "Créer mon compte"}
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
