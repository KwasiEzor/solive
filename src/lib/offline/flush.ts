import { allQueued, removeQueued } from "./queue";

/**
 * Replay queued submissions to /api/contact. Works from the page and the SW.
 * The `x-solive-replay` header lets the middleware accept it without an Origin
 * (SW fetches lack one); cross-origin forging is blocked by CORS preflight.
 * The endpoint is idempotent on client_id, so a double replay is harmless.
 */
export async function flushContactQueue(
  fetchImpl: typeof fetch = fetch,
): Promise<{ sent: number; remaining: number }> {
  const items = await allQueued();
  let sent = 0;
  for (const item of items) {
    try {
      const res = await fetchImpl("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-solive-replay": "1",
        },
        body: JSON.stringify(item.payload),
      });
      // 2xx (created or duplicate) and 4xx validation both clear the item —
      // only a network failure keeps it queued for the next attempt.
      if (res.status < 500) {
        await removeQueued(item.id);
        sent++;
      }
    } catch {
      // still offline — leave it in the queue
      break;
    }
  }
  const remaining = (await allQueued()).length;
  return { sent, remaining };
}
