"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setAdminLocaleAction } from "@/server/actions/admin-locale";
import type { SiteLocale } from "@/lib/i18n/locale";

/** Sets the admin dashboard's locale cookie then re-fetches the current URL. */
export function useSetAdminLocale() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLocale(locale: SiteLocale) {
    startTransition(async () => {
      await setAdminLocaleAction(locale);
      router.refresh();
    });
  }

  return { setLocale, pending };
}
