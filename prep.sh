#!/bin/bash

set -euo pipefail

source .env
export SELF_DB_URL="postgresql://$SELF_DB_USER:$SELF_DB_PASS@$SELF_DB_HOST:5432/$SELF_DB_NAME"

cd "$(dirname "$0")"

# This script loops through all directories in the src folder and runs npm install on folders that contain a package.json file.

function install_dependencies() {
    local folder="$1"
    echo "Installing dependencies in $folder"
    cd "$folder"
    rm -rf node_modules
    rm -rf dist
    npm install --loglevel=info
    npm audit fix --loglevel=info || true
    if grep -q '"types":' package.json; then
        npm run build --loglevel=info
    fi
    cd - > /dev/null
}

function traverse_folder() {
    for folder in "$1"/*; do
        if [ -d "$folder" ]; then
        if [[ $folder == *"node_modules"* ]] || [[ $folder == *"generated"* ]]; then
            continue
        fi
        if [ -f "$folder/package.json" ]; then
            install_dependencies "$folder"
        fi
        traverse_folder "$folder"
        fi
    done
}

function generate_proxy_certs() {
    (
    cd proxy
    if [ ! -d "certs" ]; then
        echo "Generating proxy certificates"
        mkdir certs
        (
        cd certs
        openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout "displaycontroller.key"  -out "displaycontroller.crt" -subj "/CN=displaycontroller"
        )
    fi
    )
}

npx npm-check-updates --upgrade --loglevel=info --deep --reject /typescript/

install_dependencies ./lib/logger

traverse_folder ./lib

traverse_folder .

generate_proxy_certs