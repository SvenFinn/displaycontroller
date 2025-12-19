#!/bin/sh

chown -R display-user:display-user /app
exec su display-user -c "$*"
