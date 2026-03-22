FROM dpage/pgadmin4:latest AS base

USER root

ARG SELF_DB_NAME
ARG SELF_DB_USER
ARG SELF_DB_PASS
ARG SELF_DB_HOST

FROM base AS build

WORKDIR /app
COPY create-configs.sh .
RUN sh ./create-configs.sh $SELF_DB_HOST $SELF_DB_NAME $SELF_DB_USER $SELF_DB_PASS

FROM base AS final

# Copy the pgadmin configuration file
COPY --from=build /app/servers.json /pgadmin4/servers.json
COPY --from=build /app/pgPass /pgPass
RUN chmod 600 /pgPass