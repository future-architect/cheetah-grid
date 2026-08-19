import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
  },
  target: "es2020",
  external: ["playwright-core"],
  fixedExtension: false,
  hash: false,
  format: ["esm"],
  dts: true,
  clean: true,
});
