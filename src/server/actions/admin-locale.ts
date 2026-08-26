"use server";
import { cookies } from "next/headers";
import { requireAdmin } from "@/server/auth/guards";
import { ADMIN_LOCALE_COOKIE } from "@/lib/i18n/admin-locale";

export async function setAdminLocaleAction(locale: "fr" | "en"): Promise<void> {
  await requireAdmin();
  const store = await cookies();
  store.set(ADMIN_LOCALE_COOKIE, locale, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 365,
  });
}
