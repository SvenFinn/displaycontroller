FROM node:alpine AS base

WORKDIR /app

ARG APP_PORT
ARG MIN_MEYTON_VERSION
ARG MAX_MEYTON_VERSION
ARG APP_VERSION

FROM base AS deps

WORKDIR /app/frontend
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --loglevel=info

FROM base AS build

WORKDIR /app/frontend
COPY package.json package-lock.json ./
RUN npm ci --loglevel=info

WORKDIR /app/ranges/types
COPY --from=range-types . .

WORKDIR /app/screens/screenManager/types
COPY --from=screen-types . .

WORKDIR /app/screens/types/files
COPY --from=files-types . .

WORKDIR /app/frontend
COPY . .
RUN export NEXT_PUBLIC_APP_PORT=$APP_PORT && \
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