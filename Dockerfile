FROM node:16-alpine3.11

RUN mkdir app

WORKDIR /app

COPY ./src/ ./src
COPY ["./tsconfig.json", "./package.json", "./package-lock.json", "./"]

RUN npm i && npm run build

CMD ["npm", "run", "start"]
