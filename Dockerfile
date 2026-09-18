# New Light Academy website — Next.js 16 (App Router), server-rendered.
#
# Multi-stage build → a small runner image that runs `node server.js` from
# Next's standalone output. Runs behind Caddy on the client's dedicated server;
# Caddy terminates TLS and proxies newlight-academy.rw to this container's :3000.
#
# Cloudinary: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is inlined into the browser
# bundle at build time, so it is a BUILD ARG. The private key/secret are
# server-side only and arrive as runtime env from the compose .env file.

# ---- deps ----------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- builder -------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public cloud name must be present at build time (baked into the client bundle).
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- runner --------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

RUN addgroup -g 10001 -S nodejs \
    && adduser -u 10001 -S -G nodejs -s /sbin/nologin nextjs

# Standalone output already contains a minimal node_modules + server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
