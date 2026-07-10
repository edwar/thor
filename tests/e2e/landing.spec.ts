import { test, expect } from "@playwright/test"

test.describe("Landing page", () => {
  test("should display the main title and CTAs", async ({ page }) => {
    await page.goto("/")

    await expect(page.locator("h1")).toContainText("Sorteos gamificados")
    await expect(page.getByText("THOR", { exact: true })).toBeVisible()
    await expect(page.getByText("Crear mi sorteo")).toBeVisible()
    await expect(page.getByText("Cómo funciona")).toBeVisible()
  })

  test("should have a link to sign in", async ({ page }) => {
    await page.goto("/")

    const signInLink = page.getByText("Iniciar sesión")
    await expect(signInLink).toBeVisible()
    await expect(signInLink).toHaveAttribute("href", "/signin")
  })

  test("should navigate to signin when clicking Crear mi sorteo", async ({ page }) => {
    await page.goto("/")
    await page.getByText("Crear mi sorteo").click()
    await page.waitForURL("/signin")
    await expect(page.getByText("Continuar con Google")).toBeVisible()
  })
})
