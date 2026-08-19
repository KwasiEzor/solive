"use client";
import { type FormEvent, useState } from "react";
import { SecHead } from "./sections";

const TYPES = [
  "Site vitrine",
  "Refonte",
  "Application web",
  "Application mobile",
  "Je ne sais pas encore",
];

export function Contact({
  head,
  email = "bonjour@solive.be",
  hideHead,
}: {
  head?: { kicker: string | null; heading: string | null };
  email?: string;
  hideHead?: boolean;
}) {
  const [sel, setSel] = useState<string[]>([]);
  const [f, setF] = useState({ nom: "", email: "", societe: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const toggle = (t: string) =>
    setSel((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  // Phase 6 wires this to POST /api/contact (Turnstile, rate limit, Resend).
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.nom.trim()) return setErr("Il manque votre nom.");
    if (!/^\S+@\S+\.\S+$/.test(f.email))
      return setErr("Cette adresse e-mail n'a pas l'air valide.");
    if (f.msg.trim().length < 10)
      return setErr("Décrivez le projet en une phrase ou deux.");
    setErr("");
    setSent(true);
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
            <h3>
              Merci {f.nom.split(" ")[0]}. Réponse sous 24 h ouvrées.
            </h3>
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
              <div
                className="chips"
                role="group"
                aria-labelledby="types-label"
              >
                {TYPES.map((t) => (
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
            <p className="err mono tiny" role="alert" aria-live="polite">
              {err}
            </p>
            <button type="submit" className="btn full">
              Envoyer la demande
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
