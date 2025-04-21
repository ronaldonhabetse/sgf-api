#----------------------------------
# Stage: Production
#----------------------------------
FROM node:18.20.4-alpine

ENV NODE_ENV=production TZ=UTC PORT=3333 HOST=0.0.0.0
ENV APP_URL=http://${HOST}:${PORT} LOG_LEVEL=info APP_KEY=lInR6CyYGgs17bj61wUuQ1iMZCiAZzlI
ENV DB_HOST=mysql-container-1 DB_PORT=3306 DB_USER=sgfuser DB_PASSWORD=sgf123 DB_DATABASE=sgf

WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala dependências de produção
RUN npm install --production

# Copia o restante do código
COPY . .

# Compila o projeto TypeScript para build/
RUN node ace build

# Instala ferramentas úteis
RUN apk --no-cache add curl jq  

# Expõe a porta do Adonis
EXPOSE 3333

# Inicia a aplicação
CMD ["node", "build/server.js"]
