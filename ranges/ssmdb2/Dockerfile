FROM node:alpine AS base

WORKDIR /app

ARG MEYTON_DB_PASS
ARG MEYTON_DB_USER
ARG SELF_DB_HOST
ARG SELF_DB_USER
ARG SELF_DB_PASS
ARG SELF_DB_NAME
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

WORKDIR /app/database/ssmdb2
COPY --from=ssmdb2 . .
RUN npm ci --loglevel=info && \
    npm run build;

WORKDIR /app/database/tableWatcher
COPY --from=table-watcher . .
RUN npm ci --loglevel=info && \
    npm run build;

WORKDIR /app/ranges/types
COPY --from=range-types . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM local-deps AS deps

WORKDIR /app/ranges/ssmdb2
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links;

FROM local-deps AS build

WORKDIR /app/ranges/ssmdb2

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

WORKDIR /app/ranges/ssmdb2

COPY . .
RUN npm run build && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" > dist/.env && \
    echo "MEYTON_DB_USER=$MEYTON_DB_USER" >> dist/.env && \
    echo "MEYTON_DB_PASS=$MEYTON_DB_PASS" >> dist/.env && \
    echo "CACHE_REFRESH_INTERVAL=$CACHE_REFRESH_INTERVAL" >> dist/.env
FROM base AS final

WORKDIR /app

RUN apk add --no-cache --update openssl # Required for prisma

COPY --from=build /app/ranges/ssmdb2/dist ./
COPY --from=deps /app/ranges/ssmdb2/node_modules ./node_modules

ENV NODE_ENV=production
ENV TZ=Europe/Berlin
ENV LOG_LEVEL=info

CMD ["node", "/app/index.js"]