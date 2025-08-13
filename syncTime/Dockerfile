FROM node:alpine AS base

WORKDIR /app

ARG SELF_DB_HOST
ARG SELF_DB_NAME
ARG SELF_DB_USER
ARG SELF_DB_PASS
ARG MEYTON_DB_USER
ARG MEYTON_DB_PASS

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

FROM deps-local-db AS deps-smdb
WORKDIR /app/database/smdb
COPY --from=smdb-db . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS local-deps
WORKDIR /app

COPY --from=deps-logger /app/logger /app/logger
COPY --from=deps-local-db /app/database/local /app/database/local
COPY --from=deps-smdb /app/database/smdb /app/database/smdb

FROM local-deps AS deps

WORKDIR /app/syncTime
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links;

FROM local-deps AS build

WORKDIR /app/syncTime

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

COPY . .
RUN npm run build && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" > dist/.env && \
    echo "MEYTON_DB_USER=$MEYTON_DB_USER" >> dist/.env && \
    echo "MEYTON_DB_PASS=$MEYTON_DB_PASS" >> dist/.env;

FROM base AS final

RUN apk add --no-cache --update openssl # Required for prisma 

COPY --from=build /app/syncTime/dist ./
COPY --from=deps /app/syncTime/node_modules ./node_modules

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "index.js"]