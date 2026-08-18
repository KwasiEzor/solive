"use client";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  confirmTotpEnrollAction,
  enrollTotpAction,
} from "@/server/actions/mfa";

type Enroll = { factorId: string; qrCode: string; secret: string };

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
    const r = await confirmTotpEnrollAction({
      factorId: enroll.factorId,
      code,
    });
    setPending(false);
    if (r.status === "ok") setRecoveryCodes(r.recoveryCodes);
    else setError(r.message);
  }

  if (recoveryCodes) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-6">
        <h1 className="text-2xl font-extrabold">Codes de récupération</h1>
        <p className="text-sm text-[var(--dim)]">
          Conservez ces 8 codes en lieu sûr. Ils ne seront affichés qu’une seule
          fois et permettent de récupérer l’accès si vous perdez votre
          téléphone.
        </p>
        <ul className="grid grid-cols-2 gap-2 rounded border border-[var(--line)] bg-[var(--bg2)] p-4 font-mono text-sm">
          {recoveryCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <button
          onClick={() => router.push("/admin")}
          className="rounded bg-acc px-4 py-2 font-semibold text-on-acc"
        >
          J’ai enregistré mes codes — continuer
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-6">
      <h1 className="text-2xl font-extrabold">Activer l’authentification à deux facteurs</h1>
      <p className="text-sm text-[var(--dim)]">
        Scannez le QR code avec votre application d’authentification, puis entrez
        le code à 6 chiffres.
      </p>
      {enroll && (
        <>
          {/* Supabase returns an SVG/data-URI QR; render as image (CSP img-src allows data:). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enroll.qrCode}
            alt="QR code d’enrôlement TOTP"
            width={200}
            height={200}
            className="self-start rounded bg-white p-2"
          />
          <p className="break-all font-mono text-xs text-[var(--dim)]">
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
              className="rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2 tracking-widest"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-acc px-4 py-2 font-semibold text-on-acc disabled:opacity-60"
            >
              {pending ? "Vérification…" : "Activer"}
            </button>
          </form>
        </>
      )}
      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-red-600">
        {error}
      </p>
    </div>
  );
}
