FROM node:alpine AS base

ARG MULTICAST_MSG_MIN_LENGTH

WORKDIR /app

FROM base AS local-deps

WORKDIR /app/logger
COPY --from=logger . .
RUN npm ci --loglevel=info && \
    npm run build

FROM local-deps AS deps

WORKDIR /app/ranges/multicast/proxy
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links; 

FROM local-deps AS build

WORKDIR /app/ranges/multicast/proxy

COPY package.json package-lock.json ./
RUN npm i --loglevel=info;

COPY . .
RUN npm run build && \
    echo "MULTICAST_MSG_MIN_LENGTH=${MULTICAST_MSG_MIN_LENGTH}" > dist/.env;

FROM base AS final

RUN adduser -D display-user && chown -R display-user /app
USER display-user

COPY --from=build /app/ranges/multicast/proxy/dist ./
COPY --from=deps /app/ranges/multicast/proxy/node_modules ./node_modules

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "index.js"]