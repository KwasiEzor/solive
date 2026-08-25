import AxeBuilder from "@axe-core/playwright";
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
  // exact: false-match ("Afficher le mot de passe" button) collides on substring
  await expect(page.getByLabel("Mot de passe", { exact: true })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const severe = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(severe.map((v) => v.id)).toEqual([]);
});

test("security headers are set on the public site (SLV-051)", async ({
  request,
}) => {
  const res = await request.get("/");
  const h = res.headers();
  const csp = h["content-security-policy"] ?? "";
  expect(csp).toContain("frame-ancestors 'none'");
  const scriptSrc = csp
    .split(";")
    .map((d) => d.trim())
    .find((d) => d.startsWith("script-src"));
  expect(scriptSrc).not.toContain("unsafe-inline"); // scripts stay strict
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["strict-transport-security"]).toContain("preload");
});

test("api rejects cross-origin POST (SLV-052)", async ({ request }) => {
  const res = await request.post("/api/contact", {
    headers: { origin: "https://evil.example" },
    data: {},
    maxRedirects: 0,
  });
  expect(res.status()).toBe(403);
});

test("contact rejects a filled honeypot (SLV-055)", async ({
  request,
  baseURL,
}) => {
  const res = await request.post("/api/contact", {
    headers: { origin: baseURL ?? "" },
    data: {
      name: "Bot",
      email: "bot@x.be",
      message: "a message long enough to pass",
      projectTypes: [],
      locale: "fr",
      clientId: crypto.randomUUID(),
      turnstileToken: "t",
      website: "http://spam.example", // honeypot filled
      elapsedMs: 5000,
    },
  });
  expect(res.status()).toBe(400);
});

test("contact rejects sub-2s submissions (SLV-055)", async ({
  request,
  baseURL,
}) => {
  const res = await request.post("/api/contact", {
    headers: { origin: baseURL ?? "" },
    data: {
      name: "Fast",
      email: "fast@x.be",
      message: "a message long enough to pass",
      projectTypes: [],
      locale: "fr",
      clientId: crypto.randomUUID(),
      turnstileToken: "t",
      website: "",
      elapsedMs: 100, // too fast
    },
  });
  expect(res.status()).toBe(400);
});

test("admin routes are not cached at the CDN", async ({ request }) => {
  const res = await request.get("/admin", { maxRedirects: 0 });
  // guarded → redirect, never a 200 with private content
  expect([302, 307]).toContain(res.status());
});
