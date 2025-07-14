#!/bin/bash

cd "$(dirname "$0")"

# This script loops through all directories in the src folder and runs npm install on folders that contain a package.json file.

function install_dependencies() {
    echo "Installing dependencies in $folder"
    cd $folder
    rm -rf node_modules
    rm -rf dist
    npm install --loglevel=info
    npm update -S --loglevel=info
    if grep -q '"types":' package.json; then
        npm run build --loglevel=info
    fi
    cd - > /dev/null
}

function traverse_folder() {
    for folder in $1/*; do
        if [ -d "$folder" ]; then
        if [[ $folder == *"node_modules"* ]] || [[ $folder == *"generated"* ]]; then
            continue
        fi
        if [ -f "$folder/package.json" ]; then
            install_dependencies $folder
        fi
        traverse_folder $folder
        fi
    done
}

traverse_folder .