import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/lib/**/*.ts"],
    coverage: {
      reporter: ["lcov", "text"],
      reportsDirectory: "coverage",
    },
  },
});
