FROM node:alpine AS base

WORKDIR /app

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

WORKDIR /app/ranges/types
COPY --from=range-types . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM local-deps AS deps

WORKDIR /app/ranges/multicast
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links;

FROM local-deps AS build

WORKDIR /app/ranges/multicast

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

COPY . .
RUN npm run build && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" > dist/.env && \
    echo "CACHE_REFRESH_INTERVAL=$CACHE_REFRESH_INTERVAL" >> dist/.env

FROM base AS final

WORKDIR /app

COPY --from=build /app/ranges/multicast/dist ./
COPY --from=deps /app/ranges/multicast/node_modules ./node_modules

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "/app/src/index.js"]