# syntax=docker/dockerfile:1.7
FROM node:18-alpine AS dev

# Set PNPM_HOME for global binaries
ENV PNPM_HOME="/pnpm-global"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack for pnpm and set working directory at root of monorepo
RUN corepack enable

WORKDIR /app

# Copy lockfiles and package definitions (for efficient caching)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/gateway-service/package.json ./services/gateway-service/package.json
COPY shared/package.json ./shared/package.json

# Install all dependencies in the monorepo (including ts-node, nodemon, etc.)
RUN pnpm install

# Copy the entire monorepo source (code comes last to leverage cache)
COPY . .

# Set working directory to gateway-service
WORKDIR /app/services/gateway-service

# Expose the port the gateway uses
EXPOSE 8080

# Start the server using ts-node (dev mode)
CMD ["pnpm", "exec", "ts-node", "src/server.ts"]
