#! /bin/bash

PROXY_NAME="%PROXY_NAME%"
APP_PORT="%APP_PORT%"

cd "$(dirname "$0")" || exit 1

export COMPOSE_MENU=0
# Stop the containers if they are running
docker compose down

if [ -e ".UPDATE" ]; then
    rm -f .UPDATE
    ./update.sh --reboot
fi


# shellcheck disable=SC2063
screen_res=$(xrandr --current | grep "*" | uniq | awk '{print $1}' | tail -n 1)
echo "Screen resolution is $screen_res"
export SCREEN_RESOLUTION=$screen_res

# Start the containers
docker compose up --remove-orphans --no-build&

# Wait for the proxy to be healthy
docker events --filter 'event=health_status' | while read event; do
    if echo "$event" | grep "$PROXY_NAME" | grep -q " healthy "; then
        break;
    fi
done

# Start unclutter
unclutter -idle 0.1 -root &

# Start chromium browser as kiosk 
chromium-browser \
 --kiosk \
 --disable-pinch \
 --overscroll-history-navigation=0 \
 --no-first-run \
 --disable-infobars \
 --noerrdialogs \
 --deny-permission-prompts \
 --disable-audio-output \
 --disable-breakpad \
 --disable-crash-reporter \
 --disable-features=TranslateUI,AutofillServerCommunication,OptimizationHintsFetching,OptimizationHint,SafeBrowsingService,SignedHTTPExchange \
 --disable-component-update \
 --disable-background-networking \
 --disable-gaia-services --gaia-url=http://0.0.0.0 \
 --disable-cache --disk-cache-dir=/dev/null --disk-cache-size=1 \
 --enable-logging --v=1 \
 --password-store=basic \
    http://localhost:$APP_PORT/show

# After chromium is closed, kill unclutter and the script
killall unclutter

# Stop the containers
docker compose down

