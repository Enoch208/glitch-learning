import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import nextConfig from "eslint-config-next/core-web-vitals";
import globals from "globals";
import glitch from "./eslint-rules/index.js";

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "next-env.d.ts"],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  nextConfig,
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
      },
    },
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "error",
    },
    plugins: {
      glitch,
    },
    rules: {
      "glitch/no-comments": "error",
      "no-console": "error",
    },
  },
  {
    files: ["eslint.config.js", "eslint-rules/**/*.js", "*.config.ts", "*.config.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
