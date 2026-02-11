# syntax=docker/dockerfile:1

# ── Stage 1: Install ALL deps (needed for build) ────────────────────────
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: Build client (Vite) + server (esbuild) ────────────────────
FROM deps AS builder
WORKDIR /app
COPY . .

# Build-time variables for the Vite client bundle (public Firebase config).
ARG VITE_FIREBASE_API_KEY=AIzaSyCjBfwZr4k6mGHLjrhdXmlcV0ODH_6CuP0
ARG VITE_FIREBASE_PROJECT_ID=blockmint-393d2
ARG VITE_FIREBASE_APP_ID=1:1181184514:web:3474e047892c119fa3ad1b
ARG VITE_FIREBASE_AUTH_DOMAIN=blockmint-393d2.firebaseapp.com
ARG VITE_FIREBASE_STORAGE_BUCKET=blockmint-393d2.firebasestorage.app

ENV VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
ENV VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
ENV VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
ENV VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
ENV VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}

RUN npm run build

# ── Stage 3: Production runtime ─────────────────────────────────────────
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# Install production deps BEFORE setting NODE_ENV so postinstall scripts work
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

ENV NODE_ENV=production

# App artifacts from the build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/attached_assets ./attached_assets

# Cloud Run injects PORT (default 8080). The server reads process.env.PORT.
EXPOSE 8080

# Use node directly (not npm) so SIGTERM reaches the process for graceful shutdown.
CMD ["node", "dist/index.mjs"]
