
/* global process, Buffer */

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

  await expect(page.getByRole("alert")).toHaveText(
    "Please enter your email address."
  );
});

test("rejects a fake PDF with an invalid PDF signature", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_EMAIL and E2E_PASSWORD must be set in client/.env.test"
    );
  }

  await page.goto("/login");

  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);

  const fakePdf = {
    name: "fake-invalid.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("This is not a real PDF file."),
  };

  await page.locator("#pdf-file").setInputFiles(fakePdf);

  await page
    .getByPlaceholder("Enter password for PDF")
    .fill("TestPassword123!");

  await page.getByRole("button", { name: "Upload PDF" }).click();

  await expect(page.getByText("Invalid PDF file.")).toBeVisible();
});

test("rejects a non-PDF upload", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_EMAIL and E2E_PASSWORD must be set in client/.env.test"
    );
  }

  await page.goto("/login");

  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);

  const nonPdfFile = {
    name: "test-file.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("This is a plain text file, not a PDF."),
  };

  const uploadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/documents/upload") &&
      response.request().method() === "POST"
  );

  await page.locator("#pdf-file").setInputFiles(nonPdfFile);

  await page
    .getByPlaceholder("Enter password for PDF")
    .fill("TestPassword123!");

  await page.getByRole("button", { name: "Upload PDF" }).click();

  const uploadResponse = await uploadResponsePromise;

  console.log("NON-PDF STATUS:", uploadResponse.status());
  console.log("NON-PDF BODY:", await uploadResponse.text());

  expect(uploadResponse.ok()).toBeFalsy();

  await expect(
    page.getByText("Only PDF files are allowed.")
  ).toBeVisible();
});

test("rejects an oversized PDF and shows the UI error", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_EMAIL and E2E_PASSWORD must be set in client/.env.test"
    );
  }

  await page.goto("/login");

  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);

  const oversizedPdf = {
    name: "oversized.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(10 * 1024 * 1024 + 1, "a"),
  };

  const uploadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/documents/upload") &&
      response.request().method() === "POST"
  );

  await page.locator("#pdf-file").setInputFiles(oversizedPdf);

  await page
    .getByPlaceholder("Enter password for PDF")
    .fill("TestPassword123!");

  await page.getByRole("button", { name: "Upload PDF" }).click();

  const uploadResponse = await uploadResponsePromise;

  console.log("OVERSIZED PDF STATUS:", uploadResponse.status());
  console.log("OVERSIZED PDF BODY:", await uploadResponse.text());

  expect(uploadResponse.ok()).toBeFalsy();

  await expect(page.getByText("File too large")).toBeVisible();
});
