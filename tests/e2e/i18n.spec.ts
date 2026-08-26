import { expect, test } from "@playwright/test";

/**
 * i18n e2e (SLV i18n). French stays the unprefixed default; English lives
 * under /en via a proxy rewrite (src/proxy.ts) — no [locale] route segment.
 */

test("/en renders English with the correct <html lang>", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("strong");
});

test("/ renders French with the correct <html lang>", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("solide");
});

test("DB content actually differs between / and /en, not just static copy", async ({
  page,
}) => {
  await page.goto("/services");
  const frTitle = await page.getByRole("heading", { level: 3 }).first().textContent();
  await page.goto("/en/services");
  const enTitle = await page.getByRole("heading", { level: 3 }).first().textContent();
  expect(frTitle).toBeTruthy();
  expect(enTitle).toBeTruthy();
  expect(enTitle).not.toBe(frTitle);
});

test("language switcher preserves the current page when toggling", async ({
  page,
}) => {
  await page.goto("/en/services");
  // A hard navigation on purpose (see lang-switch.tsx) — Next's client
  // router cache would otherwise conflate / and /en (same underlying route).
  // Nav + footer both render a switcher (SLV i18n §4) — scope to the nav one.
  await Promise.all([
    page.waitForURL("**/services"),
    page
      .getByRole("banner")
      .getByRole("link", { name: "Passer en français" })
      .click(),
  ]);
  await expect(page).toHaveURL(/\/services$/);
  await expect(page).not.toHaveURL(/\/en/);
});

test("/en/admin is not the admin panel — still redirected to login", async ({
  page,
}) => {
  await page.goto("/en/admin");
  await expect(page).toHaveURL(/\/connexion/);
});

test("/en/connexion rewrites to the same (French-only) login page — no separate admin surface", async ({
  page,
}) => {
  const res = await page.goto("/en/connexion");
  expect(res?.status()).toBe(200);
  await expect(page.getByLabel("E-mail")).toBeVisible();
});

test("sitemap includes both locale variants with alternates", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  const body = await res.text();
  expect(body).toContain("<loc>");
  expect(body).toMatch(/\/en(<\/loc>|\/)/);
  expect(body).toContain('hreflang="en"');
  expect(body).toContain('hreflang="fr"');
});
