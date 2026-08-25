"use client";
import { AlertCircle, Check, Copy, Download, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  confirmTotpEnrollAction,
  enrollTotpAction,
} from "@/server/actions/mfa";
import { OtpInput } from "./otp-input";

type Enroll = { factorId: string; qrCode: string; secret: string };

export function MfaEnrollForm() {
  const router = useRouter();
  const [enroll, setEnroll] = useState<Enroll | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    enrollTotpAction().then((r) => {
      if (!active) return;
      if (r.status === "ok") {
        setEnroll({ factorId: r.factorId, qrCode: r.qrCode, secret: r.secret });
      } else setError(r.message);
    });
    return () => {
      active = false;
    };
  }, []);

  async function verify(current: string) {
    if (!enroll) return;
    setPending(true);
    setError("");
    const r = await confirmTotpEnrollAction({
      factorId: enroll.factorId,
      code: current,
    });
    setPending(false);
    if (r.status === "ok") setRecoveryCodes(r.recoveryCodes);
    else {
      setError(r.message);
      setCode("");
    }
  }

  const onCodeChange = (v: string) => {
    setCode(v);
    if (v.length === 6) void verify(v);
  };

  const copyAll = () => {
    if (!recoveryCodes) return;
    void navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAll = () => {
    if (!recoveryCodes) return;
    const blob = new Blob(
      [
        "Solive — codes de récupération MFA\n" +
          "Conservez ce fichier en lieu sûr. Chaque code n’est utilisable qu’une fois.\n\n" +
          recoveryCodes.join("\n") +
          "\n",
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "solive-codes-recuperation.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (recoveryCodes) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 text-acc">
          <ShieldCheck size={20} />
          <h2 className="text-lg font-bold text-[var(--fg)]">
            Double authentification activée
          </h2>
        </div>
        <p className="text-sm text-[var(--dim)]">
          Conservez ces 8 codes en lieu sûr. Affichés une seule fois, ils
          permettent de récupérer l’accès si vous perdez votre téléphone —
          chacun n’est utilisable qu’une fois.
        </p>
        <ul className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg2)] p-4 font-mono text-sm">
          {recoveryCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyAll}
            className="auth-btn-ghost auth-btn flex-1"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copié" : "Copier"}
          </button>
          <button
            type="button"
            onClick={downloadAll}
            className="auth-btn-ghost auth-btn flex-1"
          >
            <Download size={16} /> Télécharger
          </button>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="auth-btn"
        >
          J’ai enregistré mes codes — continuer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--dim)]">
        Scannez le QR code avec votre application d’authentification (Google
        Authenticator, 1Password, Authy…), puis entrez le code à 6 chiffres.
      </p>
      {enroll ? (
        <>
          <div className="self-start rounded-xl border border-[var(--line)] bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={enroll.qrCode}
              alt="QR code d’enrôlement TOTP"
              width={168}
              height={168}
            />
          </div>
          <details className="text-xs text-[var(--dim)]">
            <summary className="cursor-pointer select-none hover:text-acc">
              Impossible de scanner ? Saisir la clé manuellement
            </summary>
            <p className="mt-2 break-all rounded-lg bg-[var(--bg2)] p-2.5 font-mono">
              {enroll.secret}
            </p>
          </details>
          <div className="flex flex-col gap-2">
            <label className="auth-label">Code à 6 chiffres</label>
            <OtpInput value={code} onChange={onCodeChange} autoFocus disabled={pending} />
          </div>
          <button
            type="button"
            onClick={() => void verify(code)}
            disabled={pending || code.length < 6}
            className="auth-btn"
          >
            {pending && <Loader2 size={16} className="spin" />}
            {pending ? "Vérification…" : "Activer la double authentification"}
          </button>
        </>
      ) : (
        !error && (
          <div className="flex items-center gap-2 text-sm text-[var(--dim)]">
            <Loader2 size={15} className="spin" /> Préparation de
            l’enrôlement…
          </div>
        )
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
