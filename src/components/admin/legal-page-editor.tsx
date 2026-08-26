"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveLegalPageAction } from "@/server/actions/legal";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { RichEditor } from "./rich-editor";

type SaveState = "saved" | "saving" | "dirty" | "error";

export interface EditableLegalPage {
  id: string;
  body: unknown;
  updatedAt: string;
}

function LegalSlot({
  page,
  label,
  t,
}: {
  page: EditableLegalPage;
  label: string;
  t: Dictionary["admin"]["legalEditor"];
}) {
  const [body, setBody] = useState<unknown>(page.body);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [conflict, setConflict] = useState(false);
  const updatedAt = useRef(page.updatedAt);
  const dirty = useRef(false);

  const doSave = useCallback(async () => {
    setSaveState("saving");
    const r = await saveLegalPageAction({
      id: page.id,
      body,
      expectedUpdatedAt: updatedAt.current,
    });
    if (r.ok) {
      updatedAt.current = r.value.updatedAt;
      dirty.current = false;
      setSaveState("saved");
      return;
    }
    if (r.error === "conflict") setConflict(true);
    setSaveState("error");
  }, [page.id, body]);

  useEffect(() => {
    const iv = setInterval(() => {
      if (dirty.current) void doSave();
    }, 10_000);
    return () => clearInterval(iv);
  }, [doSave]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void doSave();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [doSave]);

  const stateLabel: Record<SaveState, string> = {
    saved: t.saved,
    saving: t.saving,
    dirty: t.unsavedChanges,
    error: t.saveError,
  };

  return (
    <div className="adm-card adm-card-p flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-3">
          <span
            aria-live="polite"
            className={"text-xs " + (saveState === "error" ? "text-red-500" : "text-[var(--dim)]")}
          >
            {stateLabel[saveState]}
          </span>
          <button
            type="button"
            onClick={() => void doSave()}
            className="adm-btn adm-btn-ghost text-xs"
          >
            {t.saveButton} <kbd className="text-[10px] opacity-70">⌘S</kbd>
          </button>
        </div>
      </div>
      {conflict && (
        <p role="alert" className="text-xs text-red-500">
          {t.conflict}
        </p>
      )}
      <RichEditor
        value={body}
        onChange={(json) => {
          setBody(json);
          dirty.current = true;
          setSaveState("dirty");
        }}
      />
    </div>
  );
}

export function LegalPageEditor({
  frIntro,
  frSuite,
  enIntro,
  enSuite,
  t,
}: {
  frIntro: EditableLegalPage;
  frSuite: EditableLegalPage;
  enIntro: EditableLegalPage;
  enSuite: EditableLegalPage;
  t: Dictionary["admin"]["legalEditor"];
}) {
  const [tab, setTab] = useState<"fr" | "en">("fr");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">{t.title}</h1>
        <p className="mt-1 text-sm text-[var(--dim)]">{t.description}</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("fr")}
          className={tab === "fr" ? "adm-btn adm-btn-primary text-sm" : "adm-btn text-sm"}
        >
          {t.tabFr}
        </button>
        <button
          type="button"
          onClick={() => setTab("en")}
          className={tab === "en" ? "adm-btn adm-btn-primary text-sm" : "adm-btn text-sm"}
        >
          {t.tabEn}
        </button>
      </div>

      <div className={tab === "fr" ? "flex flex-col gap-4" : "hidden"}>
        <LegalSlot page={frIntro} label={t.introLabel} t={t} />
        <p className="rounded-lg border border-[var(--line)] bg-[var(--bg2)] px-3 py-2 text-xs text-[var(--dim)]">
          {t.subprocessorsNotice}
        </p>
        <LegalSlot page={frSuite} label={t.suiteLabel} t={t} />
      </div>

      <div className={tab === "en" ? "flex flex-col gap-4" : "hidden"}>
        <LegalSlot page={enIntro} label={t.introLabel} t={t} />
        <p className="rounded-lg border border-[var(--line)] bg-[var(--bg2)] px-3 py-2 text-xs text-[var(--dim)]">
          {t.subprocessorsNotice}
        </p>
        <LegalSlot page={enSuite} label={t.suiteLabel} t={t} />
      </div>
    </div>
  );
}
