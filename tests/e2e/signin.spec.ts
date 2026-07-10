import { test, expect } from "@playwright/test"

test.describe("Sign in page", () => {
  test("should display Google sign-in button", async ({ page }) => {
    await page.goto("/signin")

    await expect(page.getByText("THOR")).toBeVisible()
    await expect(page.getByText("Inicia sesión para gestionar tus sorteos")).toBeVisible()
    await expect(page.getByText("Continuar con Google")).toBeVisible()
  })
})
