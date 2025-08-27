# syntax=docker/dockerfile:1

# Build stage
FROM oven/bun:1.2-alpine AS builder

WORKDIR /app

# Copy package files first (for better layer caching)
COPY package.json bun.lock ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY tailwind.config.ts ./

# Install dependencies (this layer will be cached if package files don't change)
RUN bun install --frozen-lockfile --production=false

# Copy source code (only what's needed for build)
COPY src/ ./src/
COPY public/ ./public/
COPY content/ ./content/
COPY migrations/ ./migrations/
COPY drizzle.config.ts ./
COPY vitest.config.mts ./
COPY vitest-setup.ts ./

# Build application
RUN bun run build

# Production stage
FROM oven/bun:1.2-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run health-check || exit 1

# Start application
CMD ["bun", "server.js"]
