import { expect, test } from "@playwright/test";

async function swActive(page: import("@playwright/test").Page) {
  await page.waitForFunction(
    async () => {
      const r = await navigator.serviceWorker?.getRegistration();
      return !!r?.active;
    },
    null,
    { timeout: 20_000 },
  );
}

async function queueCount(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const req = indexedDB.open("solive-offline", 1);
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains("submissions")) return resolve(0);
          const store = db
            .transaction("submissions")
            .objectStore("submissions");
          const c = store.count();
          c.onsuccess = () => resolve(c.result);
          c.onerror = () => resolve(-1);
        };
        req.onerror = () => resolve(-1);
      }),
  );
}

test.describe("offline / PWA (SLV-080-088)", () => {
  test("registers a service worker", async ({ page }) => {
    await page.goto("/");
    await swActive(page);
  });

  test("queues a submission offline, drains on reconnect (SLV-083/088)", async ({
    page,
    context,
  }) => {
    await page.goto("/contact");
    await swActive(page);

    const email = `offline-${Date.now()}@solive.test`;
    await context.setOffline(true);
    await page.getByLabel("Votre nom").fill("Offline Test");
    await page.getByLabel("E-mail").fill(email);
    await page
      .getByLabel("Le projet en quelques lignes")
      .fill("Test de la file d’attente hors-ligne, un message assez long.");
    // Fill at human speed so the sub-2s bot guard doesn't reject the replay.
    await page.waitForTimeout(2200);
    await page.getByRole("button", { name: /Envoyer la demande/ }).click();

    // Honest offline confirmation + one item queued.
    await expect(page.getByText(/HORS LIGNE/)).toBeVisible();
    expect(await queueCount(page)).toBe(1);

    // Back online → the page flush replays and the queue drains to exactly one
    // lead (idempotent on client_id, SLV-084/088).
    await context.setOffline(false);
    await expect
      .poll(async () => queueCount(page), { timeout: 20_000 })
      .toBe(0);
  });
});
