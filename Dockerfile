FROM node:18.20.4-alpine AS builder
#ENV NODE_ENV=production TZ=UTC PORT=3333 HOST=localhost APP_URL=http://${HOST}:${PORT} LOG_LEVEL=info
#ENV APP_KEY=lInR6CyYGgs17bj61wUuQ1iMZCiAZzlI 
#ENV DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=sgfuser DB_PASSWORD=SGF DB_DATABASE=sgf123

# Set the working directory
WORKDIR /usr/src/app

#COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
#RUN npm install --silent && mv node_modules ../
#RUN npm install
#COPY . .
#EXPOSE 3000
#RUN chown -R node /usr/src/app
#RUN ls -ltrh
#USER node
#CMD ["node", "server.js"]

# Copy package.json and package-lock.json
COPY package*.json ./
#COPY tsconfig.json ./

# Install all dependencies, including devDependencies
RUN npm install

# Install cURL
RUN apk --no-cache add curl

# Copy the entire application
COPY . .

# Build the TypeScript application
RUN npm run build

# Stage 2: Production Stage
FROM node:18.20.4-alpine 
ENV NODE_ENV=production TZ=UTC PORT=3333 HOST=localhost APP_URL=http://${HOST}:${PORT} LOG_LEVEL=info
ENV APP_KEY=lInR6CyYGgs17bj61wUuQ1iMZCiAZzlI 
ENV DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=sgfuser DB_PASSWORD=SGF DB_DATABASE=sgf123

WORKDIR /usr/src/app

# Copy only the production dependencies
COPY package*.json ./
RUN npm install --production

# Install cURL
RUN apk --no-cache add curl

# Copy the built application from the build stage
COPY --from=builder /usr/src/app/build ./build

# Expose the default AdonisJS port
EXPOSE 3333

# Start the application
CMD ["node", "build/bin/server.js"]
