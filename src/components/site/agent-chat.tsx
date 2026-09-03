"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { hasAgentConsent, setAgentConsent } from "@/lib/consent";
import { getDictionary } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/urls";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";
import type { QualificationAgentUIMessage } from "@/lib/agents/qualification-agent";

/**
 * Floating qualification-agent launcher, site-wide (SLV, agent IA). Gated
 * behind its own consent (not the analytics banner — distinct legal basis,
 * see src/lib/consent.ts). No transcript is ever persisted server-side;
 * only what the createLead tool writes (name/email/project/summary) lands
 * in the leads table, exactly like the contact form.
 */
export function AgentChat({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).agentChat;
  const [open, setOpen] = useState(false);
  // Lazy initializer (not an effect + setState): reads localStorage once,
  // safely undefined on the server (hasAgentConsent guards typeof window).
  const [consented, setConsented] = useState(() => hasAgentConsent());
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat<QualificationAgentUIMessage>({
    transport: new DefaultChatTransport({ api: "/api/agent/chat" }),
  });

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages]);

  function accept() {
    setAgentConsent();
    setConsented(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <>
      <button
        type="button"
        className="agent-launcher"
        aria-label={open ? t.close : t.launcherLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 4h16v12H8l-4 4V4Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <div className="agent-panel" role="dialog" aria-label={t.panelTitle}>
          <div className="agent-panel-head">
            <span className="font-bold text-sm">{t.panelTitle}</span>
            <button
              type="button"
              className="agent-panel-close"
              aria-label={t.close}
              onClick={() => setOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {!consented ? (
            <div className="agent-consent">
              <p className="font-bold">{t.consentTitle}</p>
              <p className="text-sm text-[var(--dim)]">
                {t.consentBody}{" "}
                <a href={localizedPath("/confidentialite", locale)} target="_blank" rel="noreferrer">
                  {t.consentPrivacyLink}
                </a>
                .
              </p>
              <div className="flex justify-center gap-2">
                <button type="button" className="btn" onClick={accept}>
                  {t.consentAccept}
                </button>
                <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
                  {t.consentDecline}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="agent-panel-body" ref={bodyRef}>
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <div
                            key={i}
                            className={
                              "agent-msg " + (message.role === "user" ? "user" : "assistant")
                            }
                          >
                            {part.text}
                          </div>
                        );
                      }
                      if (part.type === "tool-createLead" && part.state === "output-available") {
                        return (
                          <div key={i} className="agent-msg lead-created">
                            <p className="font-bold">{t.leadCreatedTitle}</p>
                            <p className="text-sm text-[var(--dim)]">{t.leadCreatedBody}</p>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                ))}
                {status === "submitted" && (
                  <div className="agent-msg assistant mono tiny dim">{t.thinking}</div>
                )}
                {error && <div className="agent-msg assistant">{t.errorGeneric}</div>}
              </div>
              <form className="agent-form" onSubmit={submit}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.placeholder}
                  disabled={status !== "ready"}
                  autoFocus
                />
                <button type="submit" disabled={status !== "ready" || !input.trim()}>
                  {t.send}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
