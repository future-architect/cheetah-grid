import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const browser =
  process.env.VITEST_BROWSER === "firefox" ||
  process.env.VITEST_BROWSER === "webkit"
    ? process.env.VITEST_BROWSER
    : "chromium";
const browserChannel =
  process.env.VITEST_BROWSER_CHANNEL ||
  (browser === "chromium" ? "chrome" : undefined);
const launchOptions =
  browser === "chromium" && browserChannel
    ? { channel: browserChannel }
    : undefined;

export default defineConfig({
  test: {
    fileParallelism: false,
    globals: true,
    include: ["src/test/specs/**/*_spec.js"],
    setupFiles: ["src/test/vitest.setup.mjs"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(launchOptions ? { launchOptions } : undefined),
      instances: [{ browser }],
    },
    coverage: {
      include: ["src/js/**/*.{js,ts}"],
      reporter: ["html", "json", "text"],
      reportsDirectory: "coverage",
    },
  },
});
