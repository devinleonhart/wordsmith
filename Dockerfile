FROM node:14.17.1-alpine

RUN mkdir app

WORKDIR /app

COPY src/ ./src
COPY tsconfig.json .
COPY package.json .
COPY package-lock.json .

RUN npm i
RUN npm run build

CMD ["npm", "run", "start"]
