"use client";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  confirmTotpEnrollAction,
  enrollTotpAction,
} from "@/server/actions/mfa";

type Enroll = { factorId: string; qrCode: string; secret: string };

const btnStyle = {
  background: "linear-gradient(180deg, var(--acc), var(--acc-strong))",
  color: "var(--on-acc)",
  boxShadow: "var(--shadow-sm)",
} as const;
const btnCls =
  "rounded-lg px-4 py-2.5 font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-60";

export function MfaEnrollForm() {
  const router = useRouter();
  const [enroll, setEnroll] = useState<Enroll | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

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

  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    if (!enroll) return;
    setPending(true);
    setError("");
    const r = await confirmTotpEnrollAction({ factorId: enroll.factorId, code });
    setPending(false);
    if (r.status === "ok") setRecoveryCodes(r.recoveryCodes);
    else setError(r.message);
  }

  if (recoveryCodes) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Vos codes de récupération</h2>
        <p className="text-sm" style={{ color: "var(--dim)" }}>
          Conservez ces 8 codes en lieu sûr. Affichés une seule fois, ils
          permettent de récupérer l’accès si vous perdez votre téléphone.
        </p>
        <ul
          className="grid grid-cols-2 gap-2 rounded-lg p-4 font-mono text-sm"
          style={{ border: "1px solid var(--line)", background: "var(--bg2)" }}
        >
          {recoveryCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <button
          onClick={() => router.push("/admin")}
          className={btnCls}
          style={btnStyle}
        >
          J’ai enregistré mes codes — continuer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: "var(--dim)" }}>
        Scannez le QR code avec votre application d’authentification (Google
        Authenticator, 1Password, Authy…), puis entrez le code à 6 chiffres.
      </p>
      {enroll && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enroll.qrCode}
            alt="QR code d’enrôlement TOTP"
            width={176}
            height={176}
            className="self-start rounded-lg bg-white p-2"
          />
          <p
            className="break-all font-mono text-xs"
            style={{ color: "var(--dim2)" }}
          >
            Clé manuelle : {enroll.secret}
          </p>
          <form onSubmit={onConfirm} className="flex flex-col gap-3" noValidate>
            <label htmlFor="otp" className="text-sm font-medium">
              Code à 6 chiffres
            </label>
            <input
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-lg px-3 py-2.5 tracking-[0.4em]"
              style={{
                border: "1px solid var(--line)",
                background: "var(--bg2)",
                color: "var(--fg)",
              }}
            />
            <button
              type="submit"
              disabled={pending}
              className={btnCls}
              style={btnStyle}
            >
              {pending ? "Vérification…" : "Activer la double authentification"}
            </button>
          </form>
        </>
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
