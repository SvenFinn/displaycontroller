FROM node:alpine AS base

WORKDIR /app

ARG TARGET_DEFAULT_COLOR=00A078
ARG MEYTON_DB_PASS
ARG MEYTON_DB_USER
ARG SELF_DB_HOST
ARG SELF_DB_NAME
ARG SELF_DB_PASS
ARG SELF_DB_USER
ARG CACHE_REFRESH_INTERVAL

FROM base AS local-deps

WORKDIR /app/logger
COPY --from=logger . .
RUN npm ci --loglevel=info && \
    npm run build;

WORKDIR /app/database/local
COPY --from=local-db . .
RUN npm ci --loglevel=info && \
    npm run build;

WORKDIR /app/database/smdb
COPY --from=smdb . .
RUN npm ci --loglevel=info && \
    npm run build;

WORKDIR /app/database/tableWatcher
COPY --from=table-watcher . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM local-deps AS deps

WORKDIR /app/ranges/cache
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links;

FROM local-deps AS build

WORKDIR /app/ranges/cache

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

WORKDIR /app/ranges/types
COPY --from=range-types . .

WORKDIR /app/ranges/cache

COPY . .
RUN npm run build && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" > dist/.env && \
    echo "TARGET_DEFAULT_COLOR=$TARGET_DEFAULT_COLOR" >> dist/.env && \
    echo "MEYTON_DB_USER=$MEYTON_DB_USER" >> dist/.env && \
    echo "MEYTON_DB_PASS=$MEYTON_DB_PASS" >> dist/.env && \
    echo "CACHE_REFRESH_INTERVAL=$CACHE_REFRESH_INTERVAL" >> dist/.env

COPY ./package.json dist/

FROM base AS final

WORKDIR /app

RUN apk add --update --no-cache openssl # Required for prisma

COPY --from=build /app/ranges/cache/dist ./
COPY --from=deps /app/ranges/cache/node_modules ./node_modules

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "/app/cache/src/index.js"]