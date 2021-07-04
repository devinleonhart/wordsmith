FROM node:14.17.1-alpine

RUN mkdir app

WORKDIR /app

COPY ./src/ ./src
COPY ./types/ ./types
COPY ["./tsconfig.json", "./babel.config.json", "./package.json", "./package-lock.json", "./"]

RUN npm i && npm run build

CMD ["npm", "run", "start"]
