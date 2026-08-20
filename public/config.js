// Default for `npm run dev`/`vite preview`, where nothing runs the
// docker/40-generate-config-js.sh envsubst step. Empty means client.ts
// falls back to VITE_API_BASE_URL (see .env.local). The built container
// image overwrites this at start -- see Dockerfile.
window.__APP_CONFIG__ = {
  API_BASE_URL: ""
};
