"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { renderTiptap } from "@/lib/tiptap/render";
import {
  publishSectionAction,
  saveSectionAction,
  unpublishSectionAction,
} from "@/server/actions/sections";
import { RichEditor } from "./rich-editor";

type SaveState = "saved" | "saving" | "dirty" | "error";

export interface EditableSection {
  id: string;
  key: string;
  heading: string | null;
  kicker: string | null;
  body: unknown;
  status: "draft" | "published";
  updatedAt: string;
}

const STATE_LABEL: Record<SaveState, string> = {
  saved: "Enregistré",
  saving: "Enregistrement…",
  dirty: "Modifications non enregistrées",
  error: "Échec — réessayer",
};

export function SectionEditor({ section }: { section: EditableSection }) {
  const [heading, setHeading] = useState(section.heading ?? "");
  const [kicker, setKicker] = useState(section.kicker ?? "");
  const [body, setBody] = useState<unknown>(section.body);
  const [status, setStatus] = useState(section.status);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [conflict, setConflict] = useState(false);
  const updatedAt = useRef(section.updatedAt);
  const dirty = useRef(false);

  const markDirty = () => {
    dirty.current = true;
    setSaveState("dirty");
  };

  const doSave = useCallback(async (): Promise<boolean> => {
    setSaveState("saving");
    const r = await saveSectionAction({
      id: section.id,
      heading,
      kicker,
      body,
      expectedUpdatedAt: updatedAt.current,
    });
    if (r.ok) {
      updatedAt.current = r.value.updatedAt;
      dirty.current = false;
      setSaveState("saved");
      return true;
    }
    if (r.error === "conflict") setConflict(true);
    setSaveState("error");
    return false;
  }, [section.id, heading, kicker, body]);

  const doPublish = useCallback(async () => {
    if (dirty.current && !(await doSave())) return;
    const r = await publishSectionAction(section.id);
    if (r.ok) {
      updatedAt.current = r.value.updatedAt;
      setStatus("published");
    }
  }, [doSave, section.id]);

  const doUnpublish = useCallback(async () => {
    const r = await unpublishSectionAction(section.id);
    if (r.ok) {
      updatedAt.current = r.value.updatedAt;
      setStatus("draft");
    }
  }, [section.id]);

  // Autosave every 10s while dirty (SLV-071).
  useEffect(() => {
    const t = setInterval(() => {
      if (dirty.current) void doSave();
    }, 10_000);
    return () => clearInterval(t);
  }, [doSave]);

  // Warn before leaving with unsaved changes (SLV-072).
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

  // Keyboard shortcuts (SLV-074): ⌘S save, ⌘⇧P publish.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void doSave();
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        void doPublish();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [doSave, doPublish]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold capitalize tracking-tight">
            {section.key}
          </h1>
          <span
            className={
              "rounded px-2 py-0.5 text-xs " +
              (status === "published"
                ? "bg-acc text-on-acc"
                : "border border-[var(--line)] text-[var(--dim)]")
            }
          >
            {status === "published" ? "Publié" : "Brouillon"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            aria-live="polite"
            className={
              "text-sm " +
              (saveState === "error" ? "text-red-600" : "text-[var(--dim)]")
            }
          >
            {STATE_LABEL[saveState]}
          </span>
          <button
            type="button"
            onClick={() => void doSave()}
            className="rounded border border-[var(--line)] px-3 py-1.5 text-sm hover:border-acc"
          >
            Enregistrer <kbd>⌘S</kbd>
          </button>
          {status === "published" ? (
            <button
              type="button"
              onClick={() => void doUnpublish()}
              className="rounded border border-[var(--line)] px-3 py-1.5 text-sm hover:border-acc"
            >
              Dépublier
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void doPublish()}
              className="rounded bg-acc px-3 py-1.5 text-sm font-semibold text-on-acc"
            >
              Publier <kbd>⌘⇧P</kbd>
            </button>
          )}
        </div>
      </div>

      {conflict && (
        <p role="alert" className="rounded border border-red-500 p-3 text-sm text-red-600">
          Cette section a été modifiée ailleurs depuis votre ouverture. Rechargez
          la page pour récupérer la dernière version (aucun écrasement silencieux).
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Édition */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kicker" className="text-sm font-medium">
              Kicker
            </label>
            <input
              id="kicker"
              value={kicker}
              onChange={(e) => {
                setKicker(e.target.value);
                markDirty();
              }}
              className="rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="heading" className="text-sm font-medium">
              Titre
            </label>
            <input
              id="heading"
              value={heading}
              onChange={(e) => {
                setHeading(e.target.value);
                markDirty();
              }}
              className="rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Corps</span>
            <RichEditor
              value={body}
              onChange={(json) => {
                setBody(json);
                markDirty();
              }}
            />
          </div>
        </div>

        {/* Aperçu en direct (SLV-061) */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--dim)]">
            Aperçu
          </span>
          <div className="site t-chaux overflow-hidden rounded border border-[var(--line)]">
            <div className="sec" style={{ padding: "40px 24px" }}>
              <div className="sec-head">
                {kicker && (
                  <span className="mono tiny eyebrow">{kicker.toUpperCase()}</span>
                )}
                <h2>{heading}</h2>
              </div>
              <div>{renderTiptap(body)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
