FROM node:alpine AS base

WORKDIR /app

ARG MIN_SM_VERSION
ARG MAX_SM_VERSION
ARG SM_SSH_PASS
ARG SM_SSH_USER
ARG SM_DB_PASS
ARG SM_DB_USER
ARG SELF_DB_HOST
ARG SELF_DB_NAME
ARG SELF_DB_USER
ARG SELF_DB_PASS

FROM base AS deps-logger
WORKDIR /app/logger
COPY --from=logger . .
RUN npm ci --loglevel=info &&\
    npm run build;

FROM base AS deps-local-db
WORKDIR /app/database/local
COPY --from=local-db . .
RUN npm ci --loglevel=info &&\
    npm run build;

FROM deps-local-db AS deps-smdb
WORKDIR /app/database/smdb
COPY --from=smdb . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS deps-screens-types
WORKDIR /app/screens/types
COPY --from=screen-types . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS local-deps
WORKDIR /app

COPY --from=deps-logger /app/logger /app/logger
COPY --from=deps-local-db /app/database/local /app/database/local
COPY --from=deps-smdb /app/database/smdb /app/database/smdb
COPY --from=deps-screens-types /app/screens/types /app/screens/types

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
    echo "MIN_SM_VERSION=$MIN_SM_VERSION" > dist/.env && \
    echo "MAX_SM_VERSION=$MAX_SM_VERSION" >> dist/.env && \
    echo "SM_SSH_USER=$SM_SSH_USER" >> dist/.env && \
    echo "SM_SSH_PASS=$SM_SSH_PASS" >> dist/.env && \
    echo "SM_DB_USER=$SM_DB_USER" >> dist/.env && \
    echo "SM_DB_PASS=$SM_DB_PASS" >> dist/.env && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" >> dist/.env;

FROM base AS final

RUN apk add --update --no-cache netcat-openbsd sshpass openssh-client nano

WORKDIR /app

RUN adduser -D display-user && chown -R display-user /app
USER display-user

COPY --from=build /app/checkServer/dist ./
COPY --from=deps /app/checkServer/node_modules ./node_modules

EXPOSE 80

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "/app/index.js"]