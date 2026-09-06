FROM node:22-alpine AS base
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci
COPY . .
WORKDIR /app
RUN npm exec --workspace api -- prisma generate --schema prisma/schema.prisma
RUN npm run build:api

FROM base AS production-dependencies
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma/schema.prisma apps/api/prisma/schema.prisma
RUN npm ci --omit=dev --workspace api --include-workspace-root=false \
    && npm cache clean --force

FROM node:22-alpine AS runtime
WORKDIR /app/apps/api
ENV NODE_ENV=production
COPY --chown=node:node --from=production-dependencies /app/node_modules /app/node_modules
COPY --chown=node:node --from=production-dependencies /app/apps/api/node_modules ./node_modules
COPY --chown=node:node --from=build /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --chown=node:node --from=build /app/apps/api/package.json ./package.json
COPY --chown=node:node --from=build /app/apps/api/dist ./dist
COPY --chown=node:node --from=build /app/apps/api/prisma ./prisma
COPY --chown=node:node --from=build /app/apps/api/healthcheck.js ./healthcheck.js
USER node
EXPOSE 3001
CMD ["sh", "-c", "node /app/apps/api/node_modules/prisma/build/index.js migrate deploy --schema /app/apps/api/prisma/schema.prisma && node /app/apps/api/dist/main.js"]
