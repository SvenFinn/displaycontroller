FROM node:alpine AS base

WORKDIR /app

ARG SELF_DB_HOST
ARG SELF_DB_USER
ARG SELF_DB_PASS
ARG SELF_DB_NAME
ARG EVALUATIONS_VOLUME_PATH
ARG SM_SMB_USER
ARG SM_SMB_PASS

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

FROM base AS local-deps
WORKDIR /app

COPY --from=deps-logger /app/logger /app/logger
COPY --from=deps-local-db /app/database/local /app/database/local

FROM local-deps AS deps

WORKDIR /app/screens/evaluations
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links;

FROM local-deps AS build

WORKDIR /app/screens/utils/files
COPY --from=files-utils . .

WORKDIR /app/screens/evaluations

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

COPY . .
RUN npm run build && \
    echo "SELF_DB_URL=postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME" > dist/.env && \
    echo "EVALUATIONS_VOLUME_PATH=${EVALUATIONS_VOLUME_PATH}" >> dist/.env && \
    echo "SM_SMB_USER=${SM_SMB_USER}" >> dist/.env && \
    echo "SM_SMB_PASS=${SM_SMB_PASS}" >> dist/.env;

COPY ./src/entrypoint.sh ./dist/entrypoint.sh
RUN chmod +x ./dist/entrypoint.sh

FROM base AS final

WORKDIR /app

RUN apk add --no-cache nano samba-client

RUN adduser -D display-user && chown -R display-user /app
USER display-user

COPY --from=build /app/screens/evaluations/dist ./
COPY --from=deps /app/screens/evaluations/node_modules ./node_modules

VOLUME ["/app/html"]

EXPOSE 80

ENV NODE_ENV=production
ENV LOG_LEVEL=info

USER root
ENTRYPOINT [ "/app/entrypoint.sh" ]

CMD ["node", "/app/evaluations/src/index.js"]