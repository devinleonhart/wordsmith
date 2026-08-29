# syntax=docker/dockerfile:1

# --- shared base: pnpm + build toolchain + manifests ---
# python3/make/g++ are needed to compile better-sqlite3 from source: there is no
# prebuilt binary for the Node 26 ABI on Alpine/musl yet. Only the install stages
# inherit this; the runtime stage stays slim and gets just the compiled .node file.
FROM node:26.8.1-alpine AS base
RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm@11.22.0
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# --- build: full install + compile to dist ---
FROM base AS build
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY ./src ./src
RUN pnpm build

# --- prod-deps: production-only node_modules (native module included) ---
FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile

# --- runtime: slim, non-root, no toolchain or source ---
FROM node:26.8.1-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN mkdir -p /app/data && chown -R node:node /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
CMD ["node", "./dist/index.js"]
