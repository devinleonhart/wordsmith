FROM node:24.8.0-alpine3.21

RUN npm install -g pnpm

RUN mkdir app

WORKDIR /app

COPY ./src/ ./src
COPY ["./tsconfig.json", "./package.json", "./pnpm-lock.yaml", "./"]

RUN pnpm i && pnpm build

CMD ["pnpm", "start"]
