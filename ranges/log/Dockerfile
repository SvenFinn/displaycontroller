FROM node:alpine AS base

WORKDIR /app

ARG SM_SSH_USER
ARG SM_SSH_PASS
ARG SELF_DB_HOST
ARG SELF_DB_USER
ARG SELF_DB_PASS
ARG SELF_DB_NAME
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

FROM base AS deps-ttl
WORKDIR /app/lib/ttl
COPY --from=ttl . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM deps-logger AS deps-endpoints
WORKDIR /app/lib/endpoints
COPY --from=endpoints . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM deps-endpoints AS deps-ranges
WORKDIR /app/ranges/ranges
COPY --from=ranges . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM deps-logger AS deps-streams
WORKDIR /app/lib/streams
COPY --from=streams . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS local-deps
WORKDIR /app

COPY --from=deps-logger /app/lib/logger /app/lib/logger
COPY --from=deps-streams /app/lib/streams /app/lib/streams
COPY --from=deps-local-db /app/lib/database/local /app/lib/database/local
COPY --from=deps-ttl /app/lib/ttl /app/lib/ttl
COPY --from=deps-endpoints /app/lib/endpoints /app/lib/endpoints
COPY --from=deps-ranges /app/ranges/ranges /app/ranges/ranges

FROM local-deps AS deps

WORKDIR /app/ranges/log
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links;

FROM local-deps AS build

WORKDIR /app/ranges/log

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;


WORKDIR /app/ranges/log

COPY . .
RUN npm run build && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" > dist/.env && \
    echo "SM_SSH_USER=$SM_SSH_USER" >> dist/.env && \
    echo "SM_SSH_PASS=$SM_SSH_PASS" >> dist/.env && \
    echo "CACHE_REFRESH_INTERVAL=$CACHE_REFRESH_INTERVAL" >> dist/.env
COPY src/streams/range-logs.sh dist/streams/

FROM base AS final

WORKDIR /app

RUN apk add --update --no-cache sshpass openssh-client nano

RUN adduser -D display-user && chown -R display-user /app
USER display-user

COPY --from=build /app/ranges/log/dist ./
COPY --from=deps /app/ranges/log/node_modules ./node_modules

ENV NODE_ENV=production
ENV TZ=Europe/Berlin
ENV LOG_LEVEL=info

CMD ["node", "/app/index.js"]