/// <reference types="vite/client" />

// Declares the shape of our custom env vars so `import.meta.env.VITE_API_BASE_URL`
// is typed instead of falling back to `any`.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
