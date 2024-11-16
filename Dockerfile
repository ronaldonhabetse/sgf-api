#----------------------------------
# Stage 2: Production Stage
#----------------------------------
FROM node:18.20.4-alpine 
ENV NODE_ENV=production TZ=UTC PORT=3333 HOST=127.0.0.1 
ENV APP_URL=http://${HOST}:${PORT} LOG_LEVEL=info APP_KEY=lInR6CyYGgs17bj61wUuQ1iMZCiAZzlI 
ENV DB_HOST=mysql-container-1 DB_PORT=3306 DB_USER=sgfuser DB_PASSWORD=sgf123 DB_DATABASE=sgf
WORKDIR /usr/src/app
# Copy only the production dependencies
COPY package*.json ./
RUN npm install

# Install cURL and jq
RUN apk --no-cache add curl jq  

COPY . .
# Expose the default AdonisJS port
EXPOSE 3333

# Start the application
CMD ["node", "build/bin/server.js"]