/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config: standard React SPA build, plus Vitest test settings.
// jsdom environment is required so component tests can render into a fake DOM.
// globals:true lets tests use `describe`/`it`/`expect` without importing them,
// which keeps test files short and consistent with Testing Library examples.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    css: true,
    // Node >=26's own global `localStorage` (an experimental Web Storage
    // API implementation, on by default) shadows jsdom's -- app code that
    // reads localStorage before jsdom's version is consulted throws
    // instead, since Node's is unconfigured without --localstorage-file.
    // Disabling it lets jsdom's window.localStorage win like it always did.
    execArgv: ["--no-experimental-webstorage"],
  },
});
