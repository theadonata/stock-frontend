#!/bin/sh
# Runs automatically before nginx starts (nginx:alpine's docker-entrypoint.sh
# executes every executable script in /docker-entrypoint.d/, in order).
# Generates /usr/share/nginx/html/config.js from the API_BASE_URL env var so
# the same built image can be deployed to any environment unchanged --
# stock-infrastructure's Helm chart sets API_BASE_URL per environment (see
# charts/stock-hpp/templates/frontend-deployment.yaml). If API_BASE_URL is
# unset, this produces an empty string and client.ts falls back to
# VITE_API_BASE_URL/localhost:8000.
set -eu

envsubst '${API_BASE_URL}' \
  < /usr/share/nginx/html/config.js.template \
  > /usr/share/nginx/html/config.js
