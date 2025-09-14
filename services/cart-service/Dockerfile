FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

COPY . .
RUN pnpm install --no-frozen-lockfile

FROM base AS dev
WORKDIR /app/services/cart-service
CMD ["pnpm", "run", "dev"]