FROM node:lts-alpine3.16

RUN npm install -g pnpm

RUN mkdir app

WORKDIR /app

COPY ./src/ ./src
COPY ["./tsconfig.json", "./package.json", "./pnpm-lock.yaml", "./"]

RUN pnpm i && pnpm build

CMD ["pnpm", "start"]
