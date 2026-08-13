# Multi-stage build: compile the Vite app in a Node image, then serve the
# resulting static files from a minimal nginx image. Keeps the final image
# small (no node_modules/toolchain in production) and matches how the app
# would actually be deployed behind a reverse proxy per the architecture spec.

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first so this layer is cached unless package*.json change.
COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_BASE_URL is baked into the static JS bundle at build time (Vite
# env vars are compile-time, not runtime), so it must be supplied as a
# build arg when building the image for a specific backend target.
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---- Serve stage ----
FROM nginx:1.31-alpine AS serve

# The base image tag is floating and its last rebuild can lag behind Alpine's
# own package patches, so pull in current package versions at build time
# rather than trusting whatever the tag happened to resolve to.
RUN apk update && apk upgrade --no-cache

# Custom nginx config adds SPA fallback (all routes serve index.html so
# React Router's client-side routes work on a hard refresh/deep link).
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
