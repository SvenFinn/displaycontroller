FROM node:alpine AS base

ARG SELF_DB_HOST    
ARG SELF_DB_NAME
ARG SELF_DB_USER
ARG SELF_DB_PASS

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

FROM base AS deps-screens-types
WORKDIR /app/screens/types
COPY --from=screen-types . .
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

FROM base AS local-deps
WORKDIR /app

COPY --from=deps-logger /app/lib/logger /app/lib/logger
COPY --from=deps-local-db /app/lib/database/local /app/lib/database/local
COPY --from=deps-endpoints /app/lib/endpoints /app/lib/endpoints
COPY --from=deps-screens-types /app/screens/types /app/screens/types
COPY --from=deps-ranges /app/ranges/ranges /app/ranges/ranges


FROM local-deps AS deps

WORKDIR /app/screens/screenManager
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links; 

FROM local-deps AS build

WORKDIR /app/screens/screenManager

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

WORKDIR /app/screens/utils/files
COPY --from=file-utils . .

WORKDIR /app/screens/screenManager

COPY . .
RUN npm run build && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" > dist/.env;

FROM base AS final

WORKDIR /app

RUN adduser -D display-user && chown -R display-user /app
USER display-user

COPY --from=build /app/screens/screenManager/dist ./
COPY --from=deps /app/screens/screenManager/node_modules ./node_modules

EXPOSE 80

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "/app/screenManager/src/index.js"]