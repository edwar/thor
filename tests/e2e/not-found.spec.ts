import { test, expect } from "@playwright/test"

test.describe("404 handling", () => {
  test("should show 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-does-not-exist")
    expect(response?.status()).toBe(404)
  })
})
