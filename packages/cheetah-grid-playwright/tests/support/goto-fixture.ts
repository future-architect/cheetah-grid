import type { Page } from "playwright";

/**
 * Navigates to a fixture page and waits until its grid is created.
 * Fails fast with a clear message when the cheetah-grid bundle has not
 * been built: a missing file: subresource does not fail the navigation,
 * so without this check every test would silently burn the full hook
 * timeout waiting for a grid that can never appear.
 */
export async function gotoFixture(page: Page, url: string): Promise<void> {
  await page.goto(url);
  const loaded = await page.evaluate(
    () =>
      typeof (window as { cheetahGrid?: unknown }).cheetahGrid !== "undefined"
  );
  if (!loaded) {
    throw new Error(
      "cheetah-grid is not loaded in the fixture page. Build it first (e.g. `pnpm run build:ci` in the repository root)."
    );
  }
  await page.waitForFunction(() => (window as { grid?: unknown }).grid != null);
}
