import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { flushContactQueue } from "./lib/offline/flush";

// Service worker (SLV-081). Differentiated caching + navigation fallback.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // No automatic skipWaiting — the app prompts an explicit reload (SLV-086).
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/hors-ligne",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();

// Background Sync replay of the offline contact queue (SLV-083/084).
interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}
self.addEventListener("sync", (event) => {
  const e = event as unknown as SyncEvent;
  if (e.tag === "sync-contact") {
    e.waitUntil(flushContactQueue());
  }
});

// Let the page trigger skipWaiting after the user accepts an update (SLV-086).
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
