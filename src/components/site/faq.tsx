"use client";
import { useState } from "react";
import type { FaqItem } from "@/server/db/types";
import { SecHead } from "./sections";

/**
 * Minimal Tiptap-JSON → plain text for the FAQ answer. A full server-side
 * whitelist renderer arrives in Phase 5 (SLV-053); the seed stores plain text.
 */
function answerText(answer: unknown): string {
  if (typeof answer === "string") return answer;
  if (answer && typeof answer === "object" && "content" in answer) {
    const walk = (node: unknown): string => {
      if (!node || typeof node !== "object") return "";
      const n = node as { text?: string; content?: unknown[] };
      if (typeof n.text === "string") return n.text;
      return (n.content ?? []).map(walk).join("");
    };
    return walk(answer);
  }
  return "";
}

export function Faq({ head, items }: { head?: { kicker: string | null; heading: string | null }; items: FaqItem[] }) {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="sec">
      <div className="wrap narrow">
        <SecHead
          kicker={head?.kicker ?? "Questions"}
          titre={head?.heading ?? "Ce qu'on nous demande avant de signer."}
        />
        <div className="faq">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.id} className={"faq-item" + (isOpen ? " on" : "")}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${f.id}`}
                >
                  <span>{f.question}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      d="M8 2v12M2 8h12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <div className="faq-a" id={`faq-a-${f.id}`} role="region">
                  <div>{answerText(f.answer)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
