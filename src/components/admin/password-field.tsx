"use client";
import { type KeyboardEvent, useState } from "react";

function scorePassword(pw: string): number {
  let s = 0;
  if (pw.length >= 12) s++;
  if (pw.length >= 16) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

const STRENGTH = ["Très faible", "Faible", "Moyen", "Bon", "Fort"];
const STRENGTH_COLOR = ["#ef4444", "#f59e0b", "#eab308", "#84cc16", "var(--acc)"];

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete = "current-password",
  showStrength = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  showStrength?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const score = scorePassword(value);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    setCaps(e.getModifierState?.("CapsLock") ?? false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={onKey}
          autoComplete={autoComplete}
          required
          className="w-full rounded-lg px-3 py-2.5 pr-20"
          style={{
            border: "1px solid var(--line)",
            background: "var(--bg2)",
            color: "var(--fg)",
          }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs"
          style={{ color: "var(--dim)" }}
          aria-pressed={show}
        >
          {show ? "Masquer" : "Afficher"}
        </button>
      </div>

      {caps && (
        <p className="text-xs" style={{ color: "#f59e0b" }} role="status">
          ⚠ Verrouillage des majuscules activé
        </p>
      )}

      {showStrength && value.length > 0 && (
        <div className="flex items-center gap-2" aria-live="polite">
          <div className="flex flex-1 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{
                  background:
                    i < score ? STRENGTH_COLOR[score] : "var(--line)",
                }}
              />
            ))}
          </div>
          <span className="text-xs" style={{ color: "var(--dim)" }}>
            {STRENGTH[score]}
          </span>
        </div>
      )}
    </div>
  );
}
