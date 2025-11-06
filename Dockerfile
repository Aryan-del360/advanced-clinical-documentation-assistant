# Use official Node LTS image
FROM node:20-bullseye-slim AS build
WORKDIR /app

COPY package.json package-lock.json* ./
# Install all dependencies (including dev) for the build step so Vite is available
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:20-bullseye-slim AS runtime
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./server.js
# Install only production dependencies in the runtime image
RUN npm install --omit=dev --no-audit --no-fund
EXPOSE 8080
CMD ["node","server.js"]
