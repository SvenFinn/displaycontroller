FROM node:alpine AS base

WORKDIR /app

ARG MEYTON_SSH_USER
ARG MEYTON_SSH_PASS
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

WORKDIR /app/ranges/ttl
COPY --from=range-ttl . .
RUN npm ci --loglevel=ifno && \
    npm run build;

FROM local-deps AS deps

WORKDIR /app/ranges/log
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links;

FROM local-deps AS build

WORKDIR /app/ranges/log

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

WORKDIR /app/ranges/types
COPY --from=range-types . .

WORKDIR /app/ranges/log

COPY . .
RUN npm run build && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" > dist/.env && \
    echo "MEYTON_SSH_USER=$MEYTON_SSH_USER" >> dist/.env && \
    echo "MEYTON_SSH_PASS=$MEYTON_SSH_PASS" >> dist/.env && \
    echo "CACHE_REFRESH_INTERVAL=$CACHE_REFRESH_INTERVAL" >> dist/.env
COPY src/streams/range-logs.sh dist/log/src/streams/

FROM base AS final

WORKDIR /app

RUN apk add --update --no-cache sshpass openssh-client

COPY --from=build /app/ranges/log/dist ./
COPY --from=deps /app/ranges/log/node_modules ./node_modules

ENV NODE_ENV=production
ENV TZ=Europe/Berlin
ENV LOG_LEVEL=info

CMD ["node", "/app/log/src/index.js"]