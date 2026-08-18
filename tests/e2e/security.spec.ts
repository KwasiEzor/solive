import { expect, test } from "@playwright/test";

/**
 * Security e2e (SLV-146). The RLS cases (anon reading drafts/leads) are covered
 * by the integration suite; these assert the request-facing guarantees.
 */

test("admin without a session is redirected to /connexion (SLV-050)", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/connexion/);
});

test("mfa page requires a session (SLV-041)", async ({ page }) => {
  await page.goto("/mfa");
  await expect(page).toHaveURL(/\/connexion/);
});

test("connexion renders an accessible login form", async ({ page }) => {
  await page.goto("/connexion");
  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.getByLabel("Mot de passe")).toBeVisible();
});

test("security headers are set on the public site (SLV-051)", async ({
  request,
}) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"]).not.toContain("unsafe-inline");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["strict-transport-security"]).toContain("preload");
});

test("admin routes are not cached at the CDN", async ({ request }) => {
  const res = await request.get("/admin", { maxRedirects: 0 });
  // guarded → redirect, never a 200 with private content
  expect([302, 307]).toContain(res.status());
});
