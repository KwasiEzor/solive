import { test, expect } from "@playwright/test";

test.describe("consent & privacy", () => {
  test("no cookie is set before any consent choice (SLV-121)", async ({
    page,
  }) => {
    await page.goto("/");
    const cookies = await page.context().cookies();
    // The public vitrine writes no cookie at all until the user chooses.
    expect(cookies).toEqual([]);
    const stored = await page.evaluate(() =>
      localStorage.getItem("solive-consent"),
    );
    expect(stored).toBeNull();
  });

  test("banner appears, accepting stores the choice and dismisses it", async ({
    page,
  }) => {
    await page.goto("/");
    const banner = page.getByRole("dialog", {
      name: "Consentement aux cookies",
    });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Tout accepter" }).click();
    await expect(banner).toBeHidden();
    const stored = await page.evaluate(() =>
      localStorage.getItem("solive-consent"),
    );
    expect(stored).toBe("all");
    // persists across reloads
    await page.reload();
    await expect(
      page.getByRole("dialog", { name: "Consentement aux cookies" }),
    ).toHaveCount(0);
  });

  test("legal pages render their content", async ({ page }) => {
    for (const path of ["/cookies", "/confidentialite", "/mentions-legales"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator(".legal")).toBeVisible();
    }
  });
});
