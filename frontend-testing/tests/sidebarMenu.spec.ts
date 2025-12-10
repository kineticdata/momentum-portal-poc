import test, { expect } from "@playwright/test";
import { login } from "../helpers";

test.describe("Sidebar Menu", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    
    // Ensure we're on the home page before each test
    await page.goto('/#/');
  });

  test("Go To Submit a Request", async ({ page }) => {
    // Open the navigation menu
    await page.locator("button:has(svg.tabler-icon-menu-2)").click();

    // Wait for popover to be visible
    await page.locator('[data-scope="popover"][data-part="content"]').waitFor({ state: 'visible' });

    // Click Submit a Request in the sidebar
    await page
      .locator('[data-scope="popover"][data-part="content"]')
      .locator('button:has-text("Submit a Request")')
      .click();

    // Verify the Submit Request dialog opened
    await expect(
      page.locator('[data-scope="dialog"][data-part="content"]')
    ).toBeVisible();
  });

  test("Go To Check Status", async ({ page }) => {
    // Open the navigation menu
    await page.locator("button:has(svg.tabler-icon-menu-2)").click();

    // Wait for popover to be visible
    await page.locator('[data-scope="popover"][data-part="content"]').waitFor({ state: 'visible' });

    // Click Check Status in the sidebar
    await page
      .locator('[data-scope="popover"][data-part="content"]')
      .locator('a:has-text("Check Status")')
      .click();

    // Verify that it navigated to the Check Status page
    await expect(
      page.locator("span.text-lg.md\\:text-xl.font-semibold")
    ).toContainText("Check Status");
  });

  test("Go To My Work", async ({ page }) => {
    // Open the navigation menu
    await page.locator("button:has(svg.tabler-icon-menu-2)").click();

    // Wait for popover to be visible
    await page.locator('[data-scope="popover"][data-part="content"]').waitFor({ state: 'visible' });

    // Click My Work in the sidebar
    await page
      .locator('[data-scope="popover"][data-part="content"]')
      .locator('a:has-text("My Work")')
      .click();

    // Verify that it navigated to the My Work page
    await expect(
      page.locator("span.text-lg.md\\:text-xl.font-semibold")
    ).toContainText("My Work");
  });
});
