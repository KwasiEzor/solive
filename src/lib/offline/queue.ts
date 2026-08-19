import { type DBSchema, type IDBPDatabase, openDB } from "idb";

/**
 * Offline contact queue (SLV-083). Keyed by client_id so the server dedupes
 * replays (SLV-084). Used by both the page (fallback flush) and the service
 * worker (Background Sync).
 */
export interface QueuedContact {
  id: string; // = client_id
  payload: unknown;
  createdAt: number;
}

interface QueueDB extends DBSchema {
  submissions: { key: string; value: QueuedContact };
}

const DB_NAME = "solive-offline";
const STORE = "submissions";

function db(): Promise<IDBPDatabase<QueueDB>> {
  return openDB<QueueDB>(DB_NAME, 1, {
    upgrade(d) {
      if (!d.objectStoreNames.contains(STORE)) {
        d.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

export async function enqueueContact(id: string, payload: unknown): Promise<void> {
  const d = await db();
  await d.put(STORE, { id, payload, createdAt: Date.now() });
}

export async function allQueued(): Promise<QueuedContact[]> {
  const d = await db();
  return d.getAll(STORE);
}

export async function removeQueued(id: string): Promise<void> {
  const d = await db();
  await d.delete(STORE, id);
}

export async function queuedCount(): Promise<number> {
  const d = await db();
  return d.count(STORE);
}
