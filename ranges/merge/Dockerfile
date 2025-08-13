FROM node:alpine AS base

WORKDIR /app

ARG SELF_DB_HOST
ARG SELF_DB_USER
ARG SELF_DB_PASS
ARG SELF_DB_NAME
ARG CACHE_REFRESH_INTERVAL

FROM base AS deps-logger
WORKDIR /app/logger
COPY --from=logger . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS deps-local-db
WORKDIR /app/database/local
COPY --from=local-db . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS deps-ranges-ttl
WORKDIR /app/ranges/ttl
COPY --from=range-ttl . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS deps-ranges-types
WORKDIR /app/ranges/types
COPY --from=range-types . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS local-deps
WORKDIR /app

COPY --from=deps-logger /app/logger /app/logger
COPY --from=deps-local-db /app/database/local /app/database/local
COPY --from=deps-ranges-ttl /app/ranges/ttl /app/ranges/ttl
COPY --from=deps-ranges-types /app/ranges/types /app/ranges/types

FROM local-deps AS deps

WORKDIR /app/ranges/merger
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links;

FROM local-deps AS build

WORKDIR /app/ranges/merger

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

WORKDIR /app/ranges/merger

COPY . .
RUN npm run build && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" > dist/.env && \
    echo "CACHE_REFRESH_INTERVAL=$CACHE_REFRESH_INTERVAL" >> dist/.env

FROM base AS final

WORKDIR /app

EXPOSE 80

COPY --from=build /app/ranges/merger/dist ./
COPY --from=deps /app/ranges/merger/node_modules ./node_modules

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "/app/index.js"]