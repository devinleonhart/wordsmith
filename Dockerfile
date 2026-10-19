# syntax=docker/dockerfile:1

# --- shared base: pnpm + manifests ---
# No native modules (SQLite is Node's built-in node:sqlite), so no build toolchain.
FROM node:26.11.1-alpine AS base
RUN npm install -g pnpm@11.22.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# --- build: full install + compile to dist ---
FROM base AS build
RUN pnpm install --frozen-lockfile
COPY tsconfig.json tsconfig.build.json ./
COPY ./src ./src
RUN pnpm build

# --- prod-deps: production-only node_modules ---
FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile

# --- runtime: slim, non-root, no toolchain or source ---
FROM node:26.11.1-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN mkdir -p /app/data && chown -R node:node /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
CMD ["node", "./dist/index.js"]
