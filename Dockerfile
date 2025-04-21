# Etapa 1: build
FROM node:18.20.4-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Etapa 2: produção
FROM node:18.20.4-alpine

ENV NODE_ENV=production TZ=UTC PORT=3333 HOST=0.0.0.0
ENV APP_URL=http://${HOST}:${PORT} LOG_LEVEL=info APP_KEY=lInR6CyYGgs17bj61wUuQ1iMZCiAZzlI
ENV DB_HOST=mysql-container-1 DB_PORT=3306 DB_USER=sgfuser DB_PASSWORD=sgf123 DB_DATABASE=sgf

WORKDIR /usr/src/app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build

RUN apk --no-cache add curl jq

EXPOSE 3333

CMD ["node", "build/server.js"]
