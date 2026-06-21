# ---- Stage 1: build the React PWA ----
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---- Stage 2: install server dependencies ----
FROM node:20-alpine AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev

# ---- Stage 3: final runtime image ----
FROM node:20-alpine
WORKDIR /app

# Server code + production node_modules
COPY server/ ./server/
COPY --from=server-deps /app/server/node_modules ./server/node_modules

# Built client (server serves this as static files)
COPY --from=client-build /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/health || exit 1

CMD ["node", "server/src/index.js"]
