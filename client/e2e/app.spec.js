import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByText("Secure your PDF documents with password protection.")
  ).toBeVisible();
});

test("login page loads", async ({ page }) => {
  await page.goto("/login");

  await expect(page).toHaveURL(/\/login$/);
});

test("register page loads", async ({ page }) => {
  await page.goto("/register");

  await expect(page).toHaveURL(/\/register$/);
});

test("forgot password page loads", async ({ page }) => {
  await page.goto("/forgot-password");

  await expect(page).toHaveURL(/\/forgot-password$/);
});

test("login shows email validation when submitted empty", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(
    page.getByRole("alert")
  ).toHaveText("Please enter your email address.");
});
