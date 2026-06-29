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

FROM node:22-alpine AS runtime
WORKDIR /app/apps/api
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
EXPOSE 3001
CMD ["sh", "-c", "npm exec --workspace api -- prisma migrate deploy --schema prisma/schema.prisma && node dist/main"]
