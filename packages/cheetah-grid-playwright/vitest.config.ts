import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/lib/**/*.ts"],
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
