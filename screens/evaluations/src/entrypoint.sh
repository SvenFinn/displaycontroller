#!/bin/sh

chown -R display-user:display-user /app/html
exec su display-user -c "$*"
