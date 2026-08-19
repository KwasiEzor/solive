"use client";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { PROJECT_TYPES } from "@/lib/schemas/contact";
import { SecHead } from "./sections";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: { sitekey: string; callback: (token: string) => void },
  ) => string;
  reset: (id?: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function Contact({
  head,
  email = "bonjour@solive.pro",
  hideHead,
}: {
  head?: { kicker: string | null; heading: string | null };
  email?: string;
  hideHead?: boolean;
}) {
  const [sel, setSel] = useState<string[]>([]);
  const [f, setF] = useState({ nom: "", email: "", societe: "", msg: "" });
  const [website, setWebsite] = useState(""); // honeypot
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [pending, setPending] = useState(false);

  const clientId = useRef<string>("");
  const mountedAt = useRef<number>(0);
  const turnstileToken = useRef<string>("");
  const widgetRef = useRef<HTMLDivElement>(null);

  // Init client id + render time on mount (impure calls belong off-render).
  useEffect(() => {
    clientId.current = crypto.randomUUID();
    mountedAt.current = Date.now();
  }, []);

  // Load + render the Turnstile widget when a site key is configured.
  useEffect(() => {
    if (!SITE_KEY) return;
    const id = "cf-turnstile-script";
    const renderWidget = () => {
      if (window.turnstile && widgetRef.current && !widgetRef.current.dataset.rendered) {
        widgetRef.current.dataset.rendered = "1";
        window.turnstile.render(widgetRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => {
            turnstileToken.current = token;
          },
        });
      }
    };
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.onload = renderWidget;
      document.head.appendChild(s);
    } else {
      renderWidget();
    }
  }, []);

  const toggle = (t: string) =>
    setSel((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.nom.trim()) return setErr("Il manque votre nom.");
    if (!/^\S+@\S+\.\S+$/.test(f.email))
      return setErr("Cette adresse e-mail n'a pas l'air valide.");
    if (f.msg.trim().length < 10)
      return setErr("Décrivez le projet en une phrase ou deux.");
    if (SITE_KEY && !turnstileToken.current)
      return setErr("Merci de valider la vérification anti-spam.");

    setErr("");
    setPending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: f.nom,
          email: f.email,
          company: f.societe || undefined,
          projectTypes: sel,
          message: f.msg,
          locale: "fr",
          clientId: clientId.current,
          clientSubmittedAt: new Date().toISOString(),
          turnstileToken: turnstileToken.current || "dev",
          website,
          elapsedMs: Date.now() - mountedAt.current,
        }),
      });
      setPending(false);
      if (res.ok) {
        setSent(true);
        return;
      }
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        retryAfterSec?: number;
      };
      if (res.status === 429)
        setErr(
          `Trop de demandes. Réessayez dans ${Math.ceil((body.retryAfterSec ?? 3600) / 60)} min.`,
        );
      else if (body.error === "too_fast")
        setErr("Envoi trop rapide — réessayez.");
      else if (body.error === "turnstile")
        setErr("La vérification anti-spam a échoué. Réessayez.");
      else setErr("Une erreur est survenue. Réessayez ou écrivez-nous.");
    } catch {
      // Offline: Phase 7 will queue this in IndexedDB + Background Sync.
      setPending(false);
      setErr(
        "Vous semblez hors ligne. Réessayez dès que la connexion revient.",
      );
    }
  }

  return (
    <section id="contact" className="sec contact">
      <div className="wrap narrow">
        {!hideHead && (
          <SecHead
            kicker={head?.kicker ?? "Contact"}
            titre={head?.heading ?? "Dites-moi ce que vous voulez construire."}
          />
        )}
        {sent ? (
          <div className="sent">
            <p className="mono tiny dim">DEMANDE ENREGISTRÉE</p>
            <h3>Merci {f.nom.split(" ")[0]}. Réponse sous 24 h ouvrées.</h3>
            <p>
              Je reviens vers vous avec deux ou trois questions et une
              proposition de créneau.
            </p>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setSent(false);
                setF({ nom: "", email: "", societe: "", msg: "" });
                setSel([]);
                setWebsite("");
                clientId.current = crypto.randomUUID();
                mountedAt.current = Date.now();
              }}
            >
              Envoyer une autre demande
            </button>
          </div>
        ) : (
          <form className="form" onSubmit={submit} noValidate>
            <div className="row2">
              <div className="field">
                <label className="mono tiny" htmlFor="nom">
                  Votre nom
                </label>
                <input
                  id="nom"
                  value={f.nom}
                  onChange={(e) => setF({ ...f, nom: e.target.value })}
                  placeholder="Camille Dupont"
                  autoComplete="name"
                />
              </div>
              <div className="field">
                <label className="mono tiny" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={f.email}
                  onChange={(e) => setF({ ...f, email: e.target.value })}
                  placeholder="camille@entreprise.be"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="field">
              <label className="mono tiny" htmlFor="societe">
                Entreprise (facultatif)
              </label>
              <input
                id="societe"
                value={f.societe}
                onChange={(e) => setF({ ...f, societe: e.target.value })}
                placeholder="Menuiserie Dupont"
                autoComplete="organization"
              />
            </div>
            <div className="field">
              <span className="mono tiny" id="types-label">
                Type de projet
              </span>
              <div className="chips" role="group" aria-labelledby="types-label">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={"chip" + (sel.includes(t) ? " on" : "")}
                    onClick={() => toggle(t)}
                    aria-pressed={sel.includes(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="mono tiny" htmlFor="msg">
                Le projet en quelques lignes
              </label>
              <textarea
                id="msg"
                rows={5}
                value={f.msg}
                onChange={(e) => setF({ ...f, msg: e.target.value })}
                placeholder="Ce que vous faites, ce qui coince aujourd'hui, et pour quand vous en avez besoin."
              />
            </div>

            {/* Honeypot — hidden from humans, tempting to bots (SLV-055). */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
              <label htmlFor="website">Ne pas remplir</label>
              <input
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {SITE_KEY && <div ref={widgetRef} className="cf-turnstile" />}

            <p className="err mono tiny" role="alert" aria-live="polite">
              {err}
            </p>
            <button type="submit" className="btn full" disabled={pending}>
              {pending ? "Envoi…" : "Envoyer la demande"}
            </button>
            <p className="mono tiny dim center">
              Ou directement : <a href={`mailto:${email}`}>{email}</a>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
