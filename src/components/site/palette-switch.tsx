"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";
import { PALETTES, type Palette } from "@/lib/palette";
import { setPaletteAction } from "@/server/actions/palette";

/**
 * Floating palette switcher: a visitor-only preference (cookie), separate
 * from the admin-set site default (site_settings.activePalette). Always
 * visible (not scroll-gated, unlike ScrollTop/FloatCta) since choosing a
 * palette is useful the moment the page loads. Bottom-left, to stay clear of
 * the ScrollTop/FloatCta stack on the bottom-right.
 */
export function PaletteSwitch({
  locale,
  current,
}: {
  locale: Locale;
  current: Palette;
}) {
  const t = getDictionary(locale).paletteSwitch;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(p: Palette) {
    setOpen(false);
    startTransition(async () => {
      await setPaletteAction(p);
      router.refresh();
    });
  }

  return (
    <div ref={ref} className="palette-switch-wrap">
      {open && (
        <div className="palette-switch-menu" role="menu">
          {PALETTES.map((p) => (
            <button
              key={p}
              type="button"
              role="menuitemradio"
              aria-checked={p === current}
              onClick={() => choose(p)}
              className={"palette-swatch t-" + p + (p === current ? " active" : "")}
              title={t[p]}
              aria-label={t[p]}
            />
          ))}
        </div>
      )}
      <button
        type="button"
        className="palette-switch"
        aria-label={t.ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1 3.19c.28.2.45.5.45.81a1 1 0 0 1-1 1Z" />
          <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>
    </div>
  );
}
