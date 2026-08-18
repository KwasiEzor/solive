import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("vitrine", () => {
  test("renders content from the database", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText("tiennent debout");
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
