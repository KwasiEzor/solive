"use client";
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
} from "react";

/**
 * Segmented one-time-code input (UX best practice): one box per digit, auto
 * advance, backspace to previous, full-code paste. Numeric only.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setAt = (i: number, digit: string) => {
    const arr = value.split("");
    arr[i] = digit;
    onChange(arr.join("").replace(/\D/g, "").slice(0, length));
  };

  const onInput = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    setAt(i, digit);
    if (i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) setAt(i, "");
      else if (i > 0) {
        setAt(i - 1, "");
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < length - 1)
      refs.current[i + 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!digits) return;
    onChange(digits);
    refs.current[Math.min(digits.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2" role="group" aria-label="Code à 6 chiffres">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`Chiffre ${i + 1}`}
          className="otp-input"
          value={value[i] ?? ""}
          onChange={(e) => onInput(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          onPaste={onPaste}
        />
      ))}
    </div>
  );
}
