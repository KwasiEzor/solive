"use client";
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { updateProfileAction, sendMyPasswordResetLinkAction } from "@/server/actions/profile";
import { useSetAdminLocale } from "./use-admin-locale";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { SiteLocale } from "@/lib/i18n/locale";

export function ProfileEditor({
  fullName,
  locale,
  t,
}: {
  fullName: string;
  locale: SiteLocale;
  t: Dictionary["admin"]["profile"];
}) {
  const [name, setName] = useState(fullName);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const { setLocale, pending: localePending } = useSetAdminLocale();

  const [resetPending, setResetPending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setStatus("idle");
    const formData = new FormData();
    formData.set("fullName", name);
    const result = await updateProfileAction(formData);
    setPending(false);
    setStatus(result.status === "ok" ? "saved" : "error");
  }

  async function onResetPassword() {
    setResetPending(true);
    await sendMyPasswordResetLinkAction();
    setResetPending(false);
    setResetSent(true);
  }

  return (
    <>
      <section className="adm-card adm-card-p flex flex-col gap-3">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium">
              {t.fullNameLabel}
            </label>
            <input
              id="fullName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
              className="adm-input"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={pending} className="adm-btn adm-btn-primary">
              {pending && <Loader2 size={16} className="spin" />}
              {pending ? t.saving : t.saveButton}
            </button>
            {status === "saved" && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--acc)]">
                <CheckCircle2 size={15} /> {t.saved}
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1.5 text-sm text-red-500">
                <AlertCircle size={15} /> {t.saveError}
              </span>
            )}
          </div>
        </form>
      </section>

      <section className="adm-card adm-card-p flex flex-col gap-3">
        <h2 className="font-bold">{t.passwordHeading}</h2>
        <p className="text-sm text-[var(--dim)]">{t.passwordText}</p>
        {resetSent ? (
          <span className="flex items-center gap-1.5 text-sm text-[var(--acc)]">
            <MailCheck size={15} /> {t.passwordSent}
          </span>
        ) : (
          <button
            type="button"
            onClick={onResetPassword}
            disabled={resetPending}
            className="adm-btn w-fit"
          >
            {resetPending && <Loader2 size={16} className="spin" />}
            {resetPending ? t.passwordSending : t.passwordButton}
          </button>
        )}
      </section>

      <section className="adm-card adm-card-p flex flex-col gap-3">
        <h2 className="font-bold">{t.languageHeading}</h2>
        <p className="text-sm text-[var(--dim)]">{t.languageText}</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={localePending}
            onClick={() => setLocale("fr")}
            className={locale === "fr" ? "adm-btn adm-btn-primary" : "adm-btn"}
          >
            Français
          </button>
          <button
            type="button"
            disabled={localePending}
            onClick={() => setLocale("en")}
            className={locale === "en" ? "adm-btn adm-btn-primary" : "adm-btn"}
          >
            English
          </button>
        </div>
      </section>
    </>
  );
}
