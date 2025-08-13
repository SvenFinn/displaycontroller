FROM node:alpine AS base

WORKDIR /app

ARG APP_PORT
ARG HTTPS_PORT
ARG MIN_MEYTON_VERSION
ARG MAX_MEYTON_VERSION
ARG APP_VERSION

FROM base AS deps-screen-types

WORKDIR /app/screens/types
COPY --from=screen-types . .
RUN npm ci --loglevel=info && \
    npm run build

FROM base AS deps-files-utils
WORKDIR /app/ranges/types
COPY --from=range-types . .
RUN npm ci --loglevel=info && \
    npm run build

FROM base AS local-deps
WORKDIR /app

COPY --from=deps-screen-types /app/screens/types /app/screens/types
COPY --from=deps-files-utils /app/ranges/types /app/ranges/types

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
    export NEXT_PUBLIC_MIN_MEYTON_VERSION=$MIN_MEYTON_VERSION && \
    export NEXT_PUBLIC_MAX_MEYTON_VERSION=$MAX_MEYTON_VERSION && \
    export NEXT_PUBLIC_APP_VERSION=$APP_VERSION && \
    npm run build;

FROM base AS final

WORKDIR /app

COPY --from=build /app/frontend/public /app/public
COPY --from=build /app/frontend/.next/standalone /app
COPY --from=build /app/frontend/.next/static /app/.next/static

ENV NODE_ENV=production
ENV PORT=80

EXPOSE 80

CMD ["node", "server.js"]