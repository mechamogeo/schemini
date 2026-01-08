import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "json-schema/index": "src/json-schema/index.ts",
    "validators/index": "src/validators/index.ts",
    "locale/index": "src/locale/index.ts",
    "locale/pt-BR": "src/locale/pt-BR.ts",
  },
  format: ["esm"],
  dts: {
    compilerOptions: {
      composite: false,
      incremental: false,
    },
  },
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  target: "es2022",
  outDir: "dist",
  external: ["libphonenumber-js"],
});
