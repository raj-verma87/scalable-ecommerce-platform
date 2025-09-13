# syntax=docker/dockerfile:1.7
# ^ enables BuildKit features like --mount=type=cache

############################################
# Stage 0: base
############################################
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

############################################
# Stage 1: deps
############################################
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/*/package.json services/*/

# Allow installing deps even if lockfile is outdated
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install -r --no-frozen-lockfile

############################################
# Stage 2: builder
############################################
FROM base AS builder
ARG SERVICE_DIR=services/cart-service
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/services/*/package.json ./services/


# Copy sources
COPY ${SERVICE_DIR} ${SERVICE_DIR}


# Build TS → JS
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm -C ${SERVICE_DIR} build

############################################
# Stage 3: runner (slim prod image)
############################################
FROM node:20-alpine  AS runner
WORKDIR /app
ENV NODE_ENV=production
ARG SERVICE_DIR=services/cart-service
ARG SERVICE_PORT=5002
RUN apk upgrade --no-cache

COPY --from=builder /app/${SERVICE_DIR}/dist ./dist
COPY --from=builder /app/${SERVICE_DIR}/package.json ./package.json

RUN corepack enable && \
    pnpm install --prod --frozen-lockfile

EXPOSE ${SERVICE_PORT}
CMD ["node", "dist/index.js"]

############################################
# Stage 4: dev (simple ts-node-dev)
############################################
FROM deps AS dev
WORKDIR /app/services/cart-service
COPY tsconfig.json /app/tsconfig.json
COPY services/cart-service ./
CMD ["pnpm", "dev"]
