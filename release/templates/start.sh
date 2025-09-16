#! /bin/bash

set -euo pipefail

PROXY_NAME="%PROXY_NAME%"
APP_PORT="%APP_PORT%"

cd "$(dirname "$0")" || exit 1

chromium_pid=0
docker_pid=0

export COMPOSE_MENU=0

### --- Utility Functions ---

function cleanup {
    echo "Stopping processes..."
    kill $docker_pid $chromium_pid 2>/dev/null || true
    docker compose down
    read -r -p "Press Enter to exit..."
}
trap cleanup EXIT

function check_update {
    if [ -e ".UPDATE" ]; then
        rm -f .UPDATE
        ./update.sh --reboot
    fi
}

### --- Setup Functions ---

function get_screen_resolution {
    local screen_res
    screen_res=$(xrandr --current | grep "\*" | uniq | awk '{print $1}' | tail -n 1 || echo "unknown")
    export SCREEN_RESOLUTION=$screen_res
}

function start_docker {
    docker compose down
    docker compose up --remove-orphans --no-build &
    docker_pid=$!
}

function wait_for_proxy {
    while true; do
        local status
        status=$(docker inspect --format='{{.State.Health.Status}}' "$PROXY_NAME" 2>/dev/null || echo "starting")
        if [ "$status" = "healthy" ]; then
            break
        fi
        sleep 1
    done
}

function start_chromium {
    local AUTOSTART=0
    if [ -e "$HOME/.config/autostart/DisplayController.desktop" ]; then
        AUTOSTART=1
    fi

    local chromium_options=(
        --kiosk
        --disable-pinch
        --overscroll-history-navigation=0
        --no-first-run
        --disable-infobars
        --noerrdialogs
        --deny-permission-prompts
        --disable-audio-output
        --disable-breakpad
        --disable-crash-reporter
        "--disable-features=TranslateUI,AutofillServerCommunication,OptimizationHintsFetching,OptimizationHint,SafeBrowsingService,SignedHTTPExchange"
        --disable-component-update
        --disable-background-networking
        --disable-gaia-services
        --gaia-url=http://127.0.0.1
        --disable-cache
        --disk-cache-dir=/dev/null
        --disk-cache-size=1
        --enable-logging
        --v=1
        --password-store=basic
        --ignore-certificate-errors
    )

    if [ $AUTOSTART -eq 1 ]; then
        chromium_options+=(--kiosk --start-fullscreen --start-maximized)
    else
        chromium_options+=(--app)
    fi

    chromium-browser \
        "${chromium_options[@]}" \
        http://localhost:$APP_PORT/show &
    chromium_pid=$!
}

### --- Main Execution Flow ---

function main {
    check_update
    get_screen_resolution
    start_docker
    wait_for_proxy
    start_chromium

    # Wait for either process to exit
    wait -n $docker_pid $chromium_pid
    EXIT_CODE=$?

    if [ $EXIT_CODE -ne 0 ]; then
        read -r -p "Press Enter to exit..."
    fi
}

main
