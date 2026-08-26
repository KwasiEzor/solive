import "server-only";
import { cookies } from "next/headers";
import type { SiteLocale } from "./locale";

export const ADMIN_LOCALE_COOKIE = "solive-admin-locale";

export async function getAdminLocale(): Promise<SiteLocale> {
  const store = await cookies();
  return store.get(ADMIN_LOCALE_COOKIE)?.value === "en" ? "en" : "fr";
}
