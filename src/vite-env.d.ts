/// <reference types="vite/client" />

// Declares the shape of our custom env vars so `import.meta.env.VITE_API_BASE_URL`
// is typed instead of falling back to `any`.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Populated at container start by the nginx image's docker-entrypoint.d
// script (envsubst on config.js.template -> /config.js, loaded by
// index.html before the app bundle). Lets one built image be promoted
// across environments unchanged, since Vite's import.meta.env is baked in
// at build time and can't vary per-deploy. See client.ts for the read.
interface AppRuntimeConfig {
  API_BASE_URL?: string;
}
interface Window {
  __APP_CONFIG__?: AppRuntimeConfig;
}
