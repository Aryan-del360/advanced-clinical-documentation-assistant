# Use official Node LTS image
FROM node:20-bullseye-slim AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM node:20-bullseye-slim AS runtime
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./server.js
RUN npm ci --omit=dev
EXPOSE 8080
CMD ["node","server.js"]
