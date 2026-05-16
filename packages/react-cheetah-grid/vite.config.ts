import { defineConfig } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReactCheetahGrid",
      formats: ["es"],
      fileName: (fmt) => `react-cheetah-grid.${fmt}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["react", "react-dom", "cheetah-grid"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "Vue",
        },
      },
    },
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["__test__/**/*.spec.tsx"],
  },
});
