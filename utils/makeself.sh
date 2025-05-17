#!/bin/bash

function install_makeself() {
    # Installs makeself to the specified target path.
    # Usage: install_makeself <target_path> [version]
    local target_path=$1
    target_path=$(readlink -f "$target_path")
    local version=${2:-"latest"}

    local latest_release_json
    latest_release_json="$(curl -fs "https://api.github.com/repos/megastep/makeself/releases/$version")"
    if [ $? -ne 0 ]; then
        echo "Failed to fetch latest release information" >&2
        exit 1
    fi

    local tmp_folder
    tmp_folder=$(mktemp -d)
    trap 'rm -rf $tmp_folder' EXIT


    local asset
    asset="$(echo "$latest_release_json" | jq -r '.assets[0].browser_download_url')"
    if [ "$asset" == "null" ] || [ -z "$asset" ]; then
        echo "Failed to parse latest release information" >&2
        exit 1
    fi
    
    curl -f -L -o "$tmp_folder/$(basename "$asset")" "$asset"
    if [ $? -ne 0 ]; then
        echo "Failed to download $asset" >&2
        exit 1
    fi

    cd "$tmp_folder" || exit

    file=$(basename "$asset")
    chmod +x "$file"
    "./$(basename "$asset")"
    if [ $? -ne 0 ]; then
        echo "Failed to install makeself" >&2
        exit 1
    fi

    cp -rv ./makeself-*/* "$target_path"

    cd - > /dev/null || exit

    chmod +x "$target_path"/*.sh

    rm -rf "$tmp_folder"
    echo "Makeself installed successfully to $target_path"
}