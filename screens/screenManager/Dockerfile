FROM node:alpine AS base

ARG SELF_DB_HOST    
ARG SELF_DB_NAME
ARG SELF_DB_USER
ARG SELF_DB_PASS

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

FROM base AS deps-screens-types
WORKDIR /app/screens/types
COPY --from=screen-types . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS deps-ranges-types
WORKDIR /app/ranges/types
COPY --from=ranges . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM base AS local-deps
WORKDIR /app

COPY --from=deps-logger /app/logger /app/logger
COPY --from=deps-local-db /app/database/local /app/database/local
COPY --from=deps-screens-types /app/screens/types /app/screens/types
COPY --from=deps-ranges-types /app/ranges/types /app/ranges/types


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

COPY --from=build /app/screens/screenManager/dist ./
COPY --from=deps /app/screens/screenManager/node_modules ./node_modules

EXPOSE 80

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "/app/screenManager/src/index.js"]