/**
 * Cookie/consent state (SLV-120..123). Stored in localStorage only — no cookie
 * is written before the user chooses, and the site loads no non-essential
 * script until `hasAnalyticsConsent()` is true. Categories can grow (analytics,
 * the future AI assistant) without touching callers.
 */
export type ConsentValue = "all" | "essential";

const KEY = "solive-consent";

export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v === "all" || v === "essential" ? v : null;
}

export function setConsent(v: ConsentValue): void {
  window.localStorage.setItem(KEY, v);
  window.dispatchEvent(new CustomEvent("solive:consent", { detail: v }));
}

/** True only after explicit opt-in to non-essential (analytics, AI, etc.). */
export function hasAnalyticsConsent(): boolean {
  return getConsent() === "all";
}

/**
 * AI assistant consent — separate from the analytics bucket above by design
 * (SLV, agent). Distinct legal basis: the privacy policy frames the AI
 * assistant as consent (art. 6.1.a RGPD, revocable any time), analytics as
 * legitimate interest (6.1.f) — two purposes, not one "accept all" button.
 * Gated inside the chat widget itself on first open, not the cookie banner.
 */
const AI_KEY = "solive-agent-consent";

export function hasAgentConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AI_KEY) === "1";
}

export function setAgentConsent(): void {
  window.localStorage.setItem(AI_KEY, "1");
}
