
import { defineConfig, devices } from "@playwright/test";
import process from "node:process";

process.loadEnvFile(".env.test");

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:5173",
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
