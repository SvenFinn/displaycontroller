#!/bin/bash

# Exit on error. Append "|| true" if you expect an error.
set -euo pipefail

source .env

DB_HOST="$(echo "$SELF_DB_URL" | cut -d'@' -f2 | cut -d':' -f1)"

until nc -z -v -w30 "$DB_HOST" 5432
do
    sleep 1
done

npx prisma migrate deploy

echo "Checking database schema..."
diff=$(npx prisma migrate diff --from-schema ./schema.prisma --to-config-datasource --script | 
        grep -sv '^--' || true | 
        grep -sv '^/*' || true |
        grep -sv '^$' || true)

if [ -n "$diff" ]; then
    echo -e "\e[31mError:\e[0m" >&2
    echo "The database schema is not up to date, even after applying migrations. Please check the following diff:" >&2
    echo "$diff" >&2
    exit 1
fi

node ./seed.js