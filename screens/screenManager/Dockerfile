FROM node:alpine AS base

ARG SELF_DB_HOST    
ARG SELF_DB_NAME
ARG SELF_DB_USER
ARG SELF_DB_PASS

FROM base AS local-deps

WORKDIR /app/logger
COPY --from=logger . .
RUN npm ci --loglevel=info && \
    npm run build;

WORKDIR /app/database/local
COPY --from=local-db . .
RUN npm ci --loglevel=info && \
    npm run build;

FROM local-deps AS deps

WORKDIR /app/screens/screenManager
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links; 

FROM local-deps AS build

WORKDIR /app/screens/screenManager

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

WORKDIR /app/ranges/types
COPY --from=ranges . .

WORKDIR /app/screens/types
COPY --from=screen-types . .

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

CMD ["node", "/app/screens/screenManager/src/index.js"]