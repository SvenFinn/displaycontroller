FROM node:alpine AS base

WORKDIR /app

ARG APP_PORT
ARG HTTPS_PORT
ARG MIN_SM_VERSION
ARG MAX_SM_VERSION
ARG APP_VERSION

FROM base AS deps-logger
WORKDIR /app/lib/logger
COPY --from=logger . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM deps-logger AS deps-endpoints
WORKDIR /app/lib/endpoints
COPY --from=endpoints . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS deps-screen-types

WORKDIR /app/screens/types
COPY --from=screen-types . .
RUN npm ci --loglevel=info && \
    npm run build

FROM deps-endpoints AS deps-ranges
WORKDIR /app/ranges/ranges
COPY --from=ranges . .
RUN npm ci --loglevel=info && \
    npm run build

FROM base AS local-deps
WORKDIR /app

COPY --from=deps-logger /app/lib/logger /app/lib/logger
COPY --from=deps-endpoints /app/lib/endpoints /app/lib/endpoints
COPY --from=deps-screen-types /app/screens/types /app/screens/types
COPY --from=deps-ranges /app/ranges/ranges /app/ranges/ranges

FROM local-deps AS deps

WORKDIR /app/frontend
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --loglevel=info

FROM local-deps AS build

WORKDIR /app/frontend
COPY package.json package-lock.json ./
RUN npm ci --loglevel=info

WORKDIR /app/screens/utils/files
COPY --from=files-utils . .

WORKDIR /app/frontend
COPY . .
RUN export NEXT_PUBLIC_APP_PORT=$APP_PORT && \
    export NEXT_PUBLIC_HTTPS_PORT=$HTTPS_PORT && \
    export NEXT_PUBLIC_MIN_SM_VERSION=$MIN_SM_VERSION && \
    export NEXT_PUBLIC_MAX_SM_VERSION=$MAX_SM_VERSION && \
    export NEXT_PUBLIC_APP_VERSION=$APP_VERSION && \
    npm run build;

FROM base AS final

WORKDIR /app

RUN adduser -D display-user && chown -R display-user /app
USER display-user

COPY --from=build /app/frontend/public /app/public
COPY --from=build /app/frontend/.next/standalone/frontend /app
COPY --from=build /app/frontend/.next/static /app/.next/static

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

CMD ["node", "server.js"]