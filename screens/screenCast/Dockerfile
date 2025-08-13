FROM node:alpine AS base

WORKDIR /app

FROM base AS deps-logger

WORKDIR /app/logger
COPY --from=logger . .
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
COPY --from=deps-screens-types /app/screens/types /app/screens/types

FROM local-deps AS deps

WORKDIR /app/screens/screenCast
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links;

FROM local-deps AS build


WORKDIR /app/screens/screenCast

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

COPY . .
RUN npm run build

FROM base AS final

WORKDIR /app

COPY --from=build /app/screens/screenCast/dist ./
COPY --from=deps /app/screens/screenCast/node_modules ./node_modules

EXPOSE 80

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "/app/index.js"]