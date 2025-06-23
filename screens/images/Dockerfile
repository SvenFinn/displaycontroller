FROM node:alpine AS base

WORKDIR /app

FROM base AS local-deps

WORKDIR /app/logger
COPY --from=logger . .
RUN npm ci --loglevel=info && \
    npm run build

FROM local-deps AS deps

WORKDIR /app/screens/images
COPY package.json package-lock.json ./
RUN npm i --omit=dev --loglevel=info --install-links

FROM local-deps AS build

WORKDIR /app/screens/types
COPY --from=screen-types . .

WORKDIR /app/screens/images

COPY package.json package-lock.json ./
RUN npm i --loglevel=info

COPY . .
RUN npm run build

# Convert icon.svg to icon.png
FROM ubuntu:latest AS convert
WORKDIR /app/screens/images
COPY src/img .
RUN apt-get update && \
    apt-get install -y --no-install-recommends inkscape

RUN inkscape --export-type=png --export-dpi=288 icon.svg && \
    inkscape --export-type=png --export-dpi=288 404.svg && \
    rm 404.svg && \
    rm icon.svg

FROM base AS final

RUN apk add --no-cache --update ghostscript graphicsmagick

COPY --from=build /app/screens/images/dist ./
COPY --from=deps /app/screens/images/node_modules ./node_modules
COPY --from=convert /app/screens/images ./images/src/img

EXPOSE 80

ENV NODE_ENV=production
ENV LOG_LEVEL=info

CMD ["node", "./images/src/index.js"]