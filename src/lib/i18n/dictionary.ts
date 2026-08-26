import type { Locale } from "@/server/queries/content";
import { en } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";

const dictionaries = { fr, en } as const;

export type Dictionary = typeof fr;

/** Synchronous — safe in both Server and Client Components (no I/O). */
export function getDictionary(locale: Locale): Dictionary {
  return locale === "en" ? dictionaries.en : dictionaries.fr;
}
