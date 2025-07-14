FROM node:alpine AS base

WORKDIR /app

ARG MIN_MEYTON_VERSION
ARG MAX_MEYTON_VERSION
ARG MEYTON_SSH_PASS
ARG MEYTON_SSH_USER
ARG MEYTON_DB_PASS
ARG MEYTON_DB_USER
ARG SELF_DB_HOST
ARG SELF_DB_NAME
ARG SELF_DB_USER
ARG SELF_DB_PASS

FROM base AS local-deps

WORKDIR /app/logger
COPY --from=logger . .
RUN npm ci --loglevel=info &&\
    npm run build;

WORKDIR /app/database/local
COPY --from=local-db . .
RUN npm ci --loglevel=info &&\
    npm run build;

WORKDIR /app/database/smdb
COPY --from=smdb . .
RUN npm ci --loglevel=info && \
    npm run build;

WORKDIR /app/screens/types
COPY --from=screen-types . .
RUN npm ci --loglevel=info && \
    npm run build;


FROM local-deps AS deps

WORKDIR /app/checkServer
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links;

FROM local-deps AS build

WORKDIR /app/checkServer

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

WORKDIR /app/checkServer

COPY . .
RUN npm run build && \
    echo "MIN_MEYTON_VERSION=$MIN_MEYTON_VERSION" > dist/.env && \
    echo "MAX_MEYTON_VERSION=$MAX_MEYTON_VERSION" >> dist/.env && \
    echo "MEYTON_SSH_USER=$MEYTON_SSH_USER" >> dist/.env && \
    echo "MEYTON_SSH_PASS=$MEYTON_SSH_PASS" >> dist/.env && \
    echo "MEYTON_DB_USER=$MEYTON_DB_USER" >> dist/.env && \
    echo "MEYTON_DB_PASS=$MEYTON_DB_PASS" >> dist/.env && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" >> dist/.env;

FROM base AS final

RUN apk add --update --no-cache netcat-openbsd sshpass openssh-client

WORKDIR /app

COPY --from=build /app/checkServer/dist ./
COPY --from=deps /app/checkServer/node_modules ./node_modules

EXPOSE 80

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "/app/index.js"]