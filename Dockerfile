FROM node:24.16.0-alpine

RUN npm install -g pnpm@11.3.0

RUN mkdir -p /app/data

WORKDIR /app

COPY ./src/ ./src
COPY ["./tsconfig.json", "./package.json", "./pnpm-lock.yaml", "./.npmrc", "./pnpm-workspace.yaml", "./"]

RUN pnpm i && pnpm build

CMD ["pnpm", "start"]
