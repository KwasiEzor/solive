export const PALETTES = ["chaux", "ardoise", "cobalt"] as const;
export type Palette = (typeof PALETTES)[number];

/** Per-visitor override of the site's default palette (cookie, not DB). */
export const PALETTE_COOKIE = "solive-palette";

export function isPalette(value: string): value is Palette {
  return (PALETTES as readonly string[]).includes(value);
}
