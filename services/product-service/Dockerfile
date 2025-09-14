# ---------- Base Layer ----------
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

# Copy full monorepo so pnpm can resolve workspace packages
COPY . .

# Install dependencies (from root)
RUN pnpm install --no-frozen-lockfile

# ---------- Dev Layer ----------
FROM base AS dev
WORKDIR /app/services/product-service

CMD ["pnpm", "run", "dev"]
