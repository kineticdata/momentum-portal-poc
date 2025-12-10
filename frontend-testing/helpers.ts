import { Page } from "@playwright/test";
import { TEST_HOST, USERNAME, PASSWORD } from "./constants";

export async function login(page: Page) {
  await page.goto(`${TEST_HOST}/#/`);
  await page.getByLabel("Username").fill(USERNAME);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  
  // Wait for successful login by verifying URL stays on home page
  await page.waitForURL(`${TEST_HOST}/#/`);
}
