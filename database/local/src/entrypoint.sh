#!/bin/bash

source .env

DB_HOST="$(echo "$SELF_DB_URL" | cut -d'@' -f2 | cut -d':' -f1)"

until nc -z -v -w30 "$DB_HOST" 5432
do
    sleep 1
done

npx prisma migrate deploy