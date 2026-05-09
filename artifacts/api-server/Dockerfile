FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

FROM base AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json .npmrc ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @lintshiwe/api-server run build

FROM base AS runner

WORKDIR /app

COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/lib/db/dist ./lib/db/dist
COPY --from=builder /app/lib/api-zod/dist ./lib/api-zod/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/artifacts/api-server/node_modules ./artifacts/api-server/node_modules
COPY --from=builder /app/artifacts/api-server/package.json ./artifacts/api-server/package.json

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "--enable-source-maps", "dist/index.mjs"]
