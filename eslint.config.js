// Flat config (eslint.config.js) replaces .eslintrc.cjs -- legacy config
// support was removed in ESLint 9+.
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  {
    // Plain script (not a module, not bundled) that runs in the browser
    // before the app loads -- see index.html/vite-env.d.ts. Needs browser
    // globals since it's not covered by the ts/tsx block below.
    files: ["public/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: globals.browser,
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // TypeScript already catches genuinely-undefined identifiers (and
      // does so correctly for ambient/global types, unlike no-undef), so
      // typescript-eslint's own eslint-recommended config turns off a
      // handful of core rules -- including no-undef -- for TS files.
      ...tsPlugin.configs["eslint-recommended"].overrides[0].rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs["recommended-latest"].rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
];
