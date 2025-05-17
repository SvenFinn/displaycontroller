#!/bin/bash

cd "$(dirname "$0")" || exit

APP_VERSION=$1
PROXY_NAME="dc-reverse-proxy"
APP_PORT=80
GITHUB_REPO="SvenFinn/displaycontroller"

if [ -z "$APP_VERSION" ]; then
    echo "Usage: $0 <app_version>"
    exit 1
fi

function package(){
    local source_path=$1
    local executable_name=$2
    local target_file=$3

    local makeself_path
    makeself_path=$(mktemp -d)
    trap 'rm -rf $makeself_path' EXIT

    source ../utils/makeself.sh
    install_makeself "$makeself_path" "latest"
    if [ $? -ne 0 ]; then
        echo "Failed to install makeself" >&2
        exit 1
    fi

    #cd "$source_path" || exit
    local makeself_options
    makeself_options=(
        --gzip
        --sha256
        "${source_path}"
        "$target_file"
        "DisplayController"
        "$executable_name"
    )

    $makeself_path/makeself.sh "${makeself_options[@]}"
    if [ $? -ne 0 ]; then
        echo "Failed to create self-extracting archive" >&2
        exit 1
    fi
}


function generate_compose(){

    cd ".."

    target_path=$1

    export SCREEN_RESOLUTION="\$SCREEN_RESOLUTION"

    config=$(docker compose config)

    # Remove all build-related configuration
    config=$(echo "$config" | yq 'del(.services[].build)' -y )

    # Replace all occurrences of cwd with $PROD_PATH
    config=$(echo "$config" | yq --arg CWD "$(pwd)" '.services |= map_values(.volumes[]?.source |= gsub("^" + $CWD; "./volumes"))' -y)

    config=$(echo "$config" | sed 's/$$SCREEN_RESOLUTION/${SCREEN_RESOLUTION}/g')

    cd - > /dev/null || exit

    echo "$config" > $target_path
}

function generate_script(){
    local script_path=$1
    local target_path=$2

    cp -v $script_path $target_path
    sed -i "s/%APP_VERSION%/$APP_VERSION/g" $target_path
    sed -i "s/%PROXY_NAME%/$PROXY_NAME/g" $target_path
    sed -i "s/%APP_PORT%/$APP_PORT/g" $target_path
    sed -i "s#%GITHUB_REPO%#$GITHUB_REPO#g" $target_path
}
    

tmp_folder=$(mktemp -d)
trap 'rm -rf $tmp_folder' EXIT

# Generate docker compose file
generate_compose "$tmp_folder/docker-compose.yaml"

for script in templates/*.sh; do
    generate_script "$script" "$tmp_folder/$(basename "$script")"
done

cp -v ./icon.png ../utils/sm5.3-SMDB.sh $tmp_folder

package "$tmp_folder" "./install.sh" "displaycontroller-$APP_VERSION.run"