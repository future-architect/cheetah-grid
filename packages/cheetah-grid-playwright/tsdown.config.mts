import { defineConfig } from "tsdown";

const baseConfig = {
  entry: {
    index: "./src/index.ts",
  },
  target: "es2020",
  external: ["playwright-core"],
  fixedExtension: true,
  hash: false,
};

export default defineConfig([
  {
    ...baseConfig,
    format: ["esm"],
    dts: true,
    clean: true,
  },
  {
    ...baseConfig,
    format: ["cjs"],
    dts: false,
    clean: false,
  },
]);
