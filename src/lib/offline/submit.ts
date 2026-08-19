import { enqueueContact } from "./queue";

export type SubmitResult =
  | { status: "sent" }
  | { status: "queued" }
  | { status: "error"; code: string; retryAfterSec?: number };

interface SyncRegistration {
  sync?: { register(tag: string): Promise<void> };
}

async function registerContactSync(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker?.ready;
    await (reg as unknown as SyncRegistration)?.sync?.register("sync-contact");
  } catch {
    // No Background Sync (e.g. Safari) — the page flush on next load covers it.
  }
}

/**
 * Submit the contact form (SLV-083). Offline (or on a network failure) the
 * request is stored in IndexedDB and a Background Sync is registered; the user
 * gets an honest "saved, will send when back online" confirmation.
 */
export async function submitContact(
  clientId: string,
  payload: unknown,
): Promise<SubmitResult> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    await enqueueContact(clientId, payload);
    // Best-effort — never block the confirmation on Background Sync (SLV-083).
    void registerContactSync();
    return { status: "queued" };
  }
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { status: "sent" };
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      retryAfterSec?: number;
    };
    return {
      status: "error",
      code: body.error ?? "error",
      retryAfterSec: body.retryAfterSec,
    };
  } catch {
    // Network dropped mid-request — queue it rather than lose it.
    await enqueueContact(clientId, payload);
    // Best-effort — never block the confirmation on Background Sync (SLV-083).
    void registerContactSync();
    return { status: "queued" };
  }
}
