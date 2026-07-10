import { test as base, type Page } from "@playwright/test"

export const test = base

export function expectHeading(page: Page, text: string) {
  return page.locator("h1, h2, h3").filter({ hasText: text }).first()
}

export async function expectPageTitle(page: Page, partial: string) {
  await expect(page).toHaveTitle(new RegExp(partial, "i"))
}

import { expect } from "@playwright/test"
