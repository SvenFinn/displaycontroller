FROM node:alpine AS base

WORKDIR /app

ARG TARGET_DEFAULT_COLOR=00A078
ARG SM_DB_PASS
ARG SM_DB_USER
ARG SELF_DB_HOST
ARG SELF_DB_NAME
ARG SELF_DB_PASS
ARG SELF_DB_USER
ARG CACHE_REFRESH_INTERVAL

FROM base AS deps-logger

WORKDIR /app/lib/logger
COPY --from=logger . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS deps-local-db
WORKDIR /app/lib/database/local
COPY --from=local-db . .
RUN npm ci --loglevel=info && \
    export SELF_DB_URL="postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" && \
    npm run build;

FROM deps-local-db AS deps-smdb
WORKDIR /app/lib/database/smdb
COPY --from=smdb . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM deps-logger AS deps-table-watcher
WORKDIR /app/lib/database/tableWatcher
COPY --from=table-watcher . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS deps-ranges
WORKDIR /app/ranges/ranges
COPY --from=ranges . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS local-deps
WORKDIR /app

COPY --from=deps-logger /app/lib/logger /app/lib/logger
COPY --from=deps-local-db /app/lib/database/local /app/lib/database/local
COPY --from=deps-smdb /app/lib/database/smdb /app/lib/database/smdb
COPY --from=deps-table-watcher /app/lib/database/tableWatcher /app/lib/database/tableWatcher
COPY --from=deps-ranges /app/ranges/ranges /app/ranges/ranges

FROM local-deps AS deps

WORKDIR /app/ranges/cache
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links;

FROM local-deps AS build

WORKDIR /app/ranges/cache

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

WORKDIR /app/ranges/cache

COPY . .
RUN npm run build && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" > dist/.env && \
    echo "TARGET_DEFAULT_COLOR=$TARGET_DEFAULT_COLOR" >> dist/.env && \
    echo "SM_DB_USER=$SM_DB_USER" >> dist/.env && \
    echo "SM_DB_PASS=$SM_DB_PASS" >> dist/.env && \
    echo "CACHE_REFRESH_INTERVAL=$CACHE_REFRESH_INTERVAL" >> dist/.env

COPY ./package.json dist/

FROM base AS final

WORKDIR /app

RUN apk add --update --no-cache openssl nano # Required for prisma

RUN adduser -D display-user && chown -R display-user /app
USER display-user

COPY --from=build /app/ranges/cache/dist ./
COPY --from=deps /app/ranges/cache/node_modules ./node_modules

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "/app/index.js"]