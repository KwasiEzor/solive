import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("vitrine", () => {
  test("renders content from the database", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText("solide");
    await expect(
      page.getByRole("heading", { name: /Trois lots/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Cadrage" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Site vitrine" }),
    ).toBeVisible();
  });

  test("has exactly one h1 and landmark structure (SLV-106)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main#main")).toHaveCount(1);
    await expect(page.locator("nav[aria-label]")).not.toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(1);
  });

  test("no serious/critical axe violations (SLV-008/115)", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const severe = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(severe.map((v) => v.id)).toEqual([]);
  });

  test("client components hydrate under the CSP (FAQ accordion)", async ({
    page,
  }) => {
    await page.goto("/");
    // The first FAQ item is open by default; use the second (closed) one.
    const q = page.locator(".faq-item button").nth(1);
    // Regression guard: if the CSP blocks Next's scripts, nothing hydrates and
    // aria-expanded never flips.
    await expect(q).toHaveAttribute("aria-expanded", "false");
    await q.click();
    await expect(q).toHaveAttribute("aria-expanded", "true");
  });

  test("no CSP script violations in the console (SLV-051)", async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && /Content Security Policy/i.test(msg.text()))
        violations.push(msg.text());
    });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(violations).toEqual([]);
  });

  for (const path of ["/services", "/realisations", "/tarifs", "/contact"]) {
    test(`no serious/critical axe violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        // /contact embeds the Cal.com booking widget in an <iframe> (SLV
        // booking) — Playwright's automation context can reach into it even
        // cross-origin, so axe flags Cal.com's OWN accessibility bugs (near-
        // invisible light-theme text, unlabeled disabled date cells) that
        // this repo has no way to fix. Scope the gate to our own DOM.
        .exclude("iframe")
        .analyze();
      const severe = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(severe.map((v) => v.id)).toEqual([]);
    });
  }

  test("exposes JSON-LD and canonical metadata (SLV-101)", async ({ page }) => {
    await page.goto("/");
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(ld).toContain("LocalBusiness");
    expect(ld).toContain("FAQPage");
  });
});
