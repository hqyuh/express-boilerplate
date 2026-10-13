# Stage 1: install dependencies
FROM node:22-alpine AS development

WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@11.0.9 --activate

ENV HUSKY=0

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --config.confirmModulesPurge=false --config.minimumReleaseAge=0

COPY --chown=node:node . .

USER node

# Stage 2: build
FROM node:22-alpine AS build

WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@11.0.9 --activate

ENV HUSKY=0

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

ENV NODE_ENV=production

RUN pnpm run build
RUN pnpm prune --prod --ignore-scripts --config.confirmModulesPurge=false

USER node

# Stage 3: run
FROM node:22-alpine AS production

RUN apk update && apk add --no-cache curl

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/example-swagger.yaml ./example-swagger.yaml

RUN mkdir -p /usr/src/app/logs && chown -R node:node /usr/src/app

USER node

CMD ["node", "-r", "module-alias/register", "dist/server.js"]
