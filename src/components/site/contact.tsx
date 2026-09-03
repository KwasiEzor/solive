"use client";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { CAL_BOOKING_URL } from "@/lib/cal";
import { getDictionary } from "@/lib/i18n/dictionary";
import { flushContactQueue } from "@/lib/offline/flush";
import { submitContact } from "@/lib/offline/submit";
import { PROJECT_TYPES } from "@/lib/schemas/contact";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";
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
  locale,
}: {
  head?: { kicker: string | null; heading: string | null };
  email?: string;
  hideHead?: boolean;
  locale: Locale;
}) {
  const t = getDictionary(locale).contact;
  const [tab, setTab] = useState<"book" | "message">("book");
  const [sel, setSel] = useState<string[]>([]);
  const [f, setF] = useState({ nom: "", email: "", societe: "", msg: "" });
  const [website, setWebsite] = useState(""); // honeypot
  const [sent, setSent] = useState(false);
  const [queued, setQueued] = useState(false);
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

  // Flush any queued offline submissions on load + when connectivity returns
  // (fallback for browsers without Background Sync — SLV-083).
  useEffect(() => {
    void flushContactQueue();
    const onOnline = () => void flushContactQueue();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
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

  const toggle = (pt: string) =>
    setSel((s) => (s.includes(pt) ? s.filter((x) => x !== pt) : [...s, pt]));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.nom.trim()) return setErr(t.errors.nameRequired);
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr(t.errors.emailInvalid);
    if (f.msg.trim().length < 10) return setErr(t.errors.messageTooShort);
    if (SITE_KEY && !turnstileToken.current) return setErr(t.errors.turnstileMissing);

    setErr("");
    setPending(true);
    const payload = {
      name: f.nom,
      email: f.email,
      company: f.societe || undefined,
      // The stored/emailed values stay the canonical French PROJECT_TYPES
      // strings regardless of the visitor's locale — only the chip labels
      // shown on screen are translated (see t.projectTypeLabels).
      projectTypes: sel,
      message: f.msg,
      locale,
      clientId: clientId.current,
      clientSubmittedAt: new Date().toISOString(),
      turnstileToken: turnstileToken.current || "dev",
      website,
      // Inside the submit event handler, not render — safe. The purity rule
      // misfires here once getDictionary() is called earlier in the component.
      // eslint-disable-next-line react-hooks/purity
      elapsedMs: Date.now() - mountedAt.current,
    };
    const r = await submitContact(clientId.current, payload);
    setPending(false);
    if (r.status === "sent") return setSent(true);
    if (r.status === "queued") return setQueued(true);
    if (r.code === "rate_limited")
      setErr(t.errors.rateLimited(Math.ceil((r.retryAfterSec ?? 3600) / 60)));
    else if (r.code === "too_fast") setErr(t.errors.tooFast);
    else if (r.code === "turnstile") setErr(t.errors.turnstileFailed);
    else if (r.code === "invalid") setErr(t.errors.invalid);
    else setErr(t.errors.generic);
  }

  return (
    <section id="contact" className="sec contact">
      <div className="wrap narrow">
        {!hideHead && (
          <SecHead
            kicker={head?.kicker ?? getDictionary(locale).pageHeaders.contact.kicker}
            titre={head?.heading ?? getDictionary(locale).pageHeaders.contact.title}
          />
        )}
        <div className="contact-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "book"}
            className={"plan-tab" + (tab === "book" ? " on" : "")}
            onClick={() => setTab("book")}
          >
            {t.booking.tabBook}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "message"}
            className={"plan-tab" + (tab === "message" ? " on" : "")}
            onClick={() => setTab("message")}
          >
            {t.booking.tabMessage}
          </button>
        </div>

        {tab === "book" ? (
          <div className="cal-embed-wrap">
            <span className="cal-embed-loading">{t.booking.loading}</span>
            <iframe
              src={`${CAL_BOOKING_URL}?lang=${locale}`}
              title={t.booking.ariaLabel}
              loading="lazy"
            />
          </div>
        ) : sent || queued ? (
          <div className="sent">
            <p className="mono tiny dim">{queued ? t.sent.queuedBadge : t.sent.sentBadge}</p>
            <h3>
              {queued
                ? t.sent.queuedTitle(f.nom.split(" ")[0] ?? "")
                : t.sent.sentTitle(f.nom.split(" ")[0] ?? "")}
            </h3>
            <p>{queued ? t.sent.queuedBody : t.sent.sentBody}</p>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setSent(false);
                setQueued(false);
                setF({ nom: "", email: "", societe: "", msg: "" });
                setSel([]);
                setWebsite("");
                clientId.current = crypto.randomUUID();
                mountedAt.current = Date.now();
              }}
            >
              {t.sent.again}
            </button>
          </div>
        ) : (
          <form className="form" onSubmit={submit} noValidate>
            <div className="row2">
              <div className="field">
                <label className="mono tiny" htmlFor="nom">
                  {t.labels.name}
                </label>
                <input
                  id="nom"
                  value={f.nom}
                  onChange={(e) => setF({ ...f, nom: e.target.value })}
                  placeholder={t.placeholders.name}
                  autoComplete="name"
                />
              </div>
              <div className="field">
                <label className="mono tiny" htmlFor="email">
                  {t.labels.email}
                </label>
                <input
                  id="email"
                  type="email"
                  value={f.email}
                  onChange={(e) => setF({ ...f, email: e.target.value })}
                  placeholder={t.placeholders.email}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="field">
              <label className="mono tiny" htmlFor="societe">
                {t.labels.company}
              </label>
              <input
                id="societe"
                value={f.societe}
                onChange={(e) => setF({ ...f, societe: e.target.value })}
                placeholder={t.placeholders.company}
                autoComplete="organization"
              />
            </div>
            <div className="field">
              <span className="mono tiny" id="types-label">
                {t.labels.projectType}
              </span>
              <div className="chips" role="group" aria-labelledby="types-label">
                {PROJECT_TYPES.map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    className={"chip" + (sel.includes(pt) ? " on" : "")}
                    onClick={() => toggle(pt)}
                    aria-pressed={sel.includes(pt)}
                  >
                    {t.projectTypeLabels[pt] ?? pt}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="mono tiny" htmlFor="msg">
                {t.labels.message}
              </label>
              <textarea
                id="msg"
                rows={5}
                value={f.msg}
                onChange={(e) => setF({ ...f, msg: e.target.value })}
                placeholder={t.placeholders.message}
              />
            </div>

            {/* Honeypot — hidden from humans, tempting to bots (SLV-055). */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
              <label htmlFor="website">{t.labels.honeypot}</label>
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
              {pending ? t.sending : t.submit}
            </button>
            <p className="mono tiny dim center">
              {t.orDirect} <a href={`mailto:${email}`}>{email}</a>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
