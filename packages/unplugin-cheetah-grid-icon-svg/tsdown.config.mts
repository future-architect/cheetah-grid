import { defineConfig } from "tsdown";

const entry = {
  index: "./src/index.ts",
  vite: "./src/vite.ts",
  rollup: "./src/rollup.ts",
  rolldown: "./src/rolldown.ts",
  webpack: "./src/webpack.ts",
  rspack: "./src/rspack.ts",
  esbuild: "./src/esbuild.ts",
};

const baseConfig = {
  entry: {
    ...entry,
  },
  target: "node14",
  external: ["unplugin", "@xmldom/xmldom"],
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
