FROM node:18-alpine

# Set PNPM_HOME for global binaries
ENV PNPM_HOME="/pnpm-global"
ENV PATH="$PNPM_HOME:$PATH"

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app/services/gateway-service

# Copy package files first (for layer caching)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies including devDependencies
RUN pnpm install

# Install Express Gateway locally (no global install)
RUN pnpm add express-gateway

# Copy the rest of the source code
COPY . .

# Expose gateway port
EXPOSE 8080

# Use pnpm exec to run ts-node inside container
CMD ["pnpm", "exec", "ts-node", "src/server.ts"]
