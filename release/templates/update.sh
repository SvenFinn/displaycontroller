#!/bin/bash

set -o pipefail

cd "$(dirname "$0")" || exit 1

APP_VERSION="%APP_VERSION%"
GITHUB_REPO="%GITHUB_REPO%"

BACK_TITLE="Displaycontroller Update ${APP_VERSION}"

REBOOT=0

for arg in "$@"; do
    case "$arg" in
        --reboot)
            REBOOT=1
            ;;
        *)
            echo "Unknown argument: $arg"
            exit 1
            ;;
    esac
done

function update_finished(){
    local width, height
    width=$(tput cols)
    height=$(tput lines)

    local success_top=2
    local success_height=5

    local reboot_height=7
    local reboot_top=$(( height - reboot_height - 3 ))

    if [ "$REBOOT" == "0" ]; then
        dialog --colors --backtitle "$BACK_TITLE" --begin "$success_top" 0 --title "\Z2Update finished\Zn" --msgbox "The update was finished successfully." "$success_height" "$width"
    else 
        dialog --colors --backtitle "$BACK_TITLE" --begin "$success_top" 0 --title "\Z2Update finished\Zn" --infobox "The update was finished successfully. The system will reboot shortly..." "$success_height" "$width" \
                 --and-widget --colors --begin "$reboot_top" 0 --title "Rebooting..." --no-cancel --pause "Rebooting..." "$reboot_height" "$width" 10
        reboot
        # sleep to prevent the script from exiting before the reboot
        sleep 1d
    fi
    clear
    exit 0
}

# This function takes a pipe as input, which contains the command to run
function run_update_step(){
    tput civis

    local step=$1
    local total_steps=$2
    local step_title=$3

    local nl=$'\n'
    local command="DEBIAN_FRONTEND=noninteractive$nl set -e$nl"
    while IFS= read -r line; do
        command+="${line}${nl}"
    done 
    command+="set +e$nl"

    local width  height
    width=$(tput cols)
    height=$(tput lines)

    local bar_height bar_top bar_width bar
    bar_height=2
    bar_top=$(( height - bar_height - 3 ))
    bar_width=$(( width - 6 ))
    bar=$(for _ in $(seq 1 $(((step-1)*bar_width/(total_steps-1)))); do echo -n "\Z4\Zr \Zn"; done)

    local command_top=2
    local command_height=$(( bar_top - command_top - 3 ))

    local tmp_log_file
    tmp_log_file=$(mktemp)

    eval "$command" 2>&1 | tee $tmp_log_file | dialog --colors --keep-window --backtitle "$BACK_TITLE" \
                                            --begin $bar_top 0 --title "Step $step of $total_steps: $step_title" --infobox "$bar" $bar_height $width \
                                            --and-widget --keep-window --begin $command_top 0 --title "$step_title" --progressbox $command_height $width

    local EXIT_CODE=$?

    if [ $EXIT_CODE -ne 0 ]; then
        local error_top=2
        local error_height=3

        local reboot_height=7
        local reboot_top=$(( height - reboot_height - 3 ))

        local log_top=$(( error_top + error_height + 3 ))
        local log_height=$(( reboot_top - log_top - 3 ))

        local error_message="Bei der Durchführung des Updates ist ein Fehler aufgetreten. Das Update wurde abgebrochen."

        local dialog_options=(
            --colors --keep-window --backtitle "$BACK_TITLE"
            --begin "$error_top" 0 --title "\Z1ERROR\Zn" --infobox "\Z1\Zb$error_message\Zn" 3 "$width"
            --and-widget --keep-window --colors --begin "$log_top" 0 --title "\Z1Log: $step_title\Zn" --progressbox "$command_with_newlines" "$log_height" "$width"
        )
        if [ "$REBOOT" == "0" ]; then
            cat $tmp_log_file | dialog "${dialog_options[@]}" --and-widget --keep-window --colors --begin "$reboot_top" 0 --msgbox "" "$reboot_height" "$width"
        else
            cat $tmp_log_file | dialog "${dialog_options[@]}" --and-widget --keep-window --colors --begin "$reboot_top" 0 --title "\Z1The system will reboot shortly...\Zn" --no-cancel --pause "Rebooting..." "$reboot_height" "$width" 30
        fi

        rm $tmp_log_file
        tput cnorm

        if [ "$REBOOT" == "1" ]; then
            reboot
            # sleep to prevent the script from exiting before the reboot
            sleep 1d
        fi

        exit

    fi

    sleep 1

    rm $tmp_log_file
    tput cnorm

}

# Check if the script is running as root
if [ "$EUID" -ne 0 ]; then
    # Check if sudo requires a password
    sudo -n true 2>/dev/null
    if [ $? -eq 1 ]; then
        pkexec --keep-cwd $0 "$@"
    else
        sudo $0 "$@"
    fi
    exit
fi

step_nr=1
total_steps=8

run_update_step $((step_nr++)) $total_steps "Connecting to the internet" <<EOF
resolvectl flush-caches
while ! ping -c 1 github.com
do
    sleep 1
done
EOF

run_update_step $((step_nr++)) $total_steps "Updating package list" <<EOF
apt-get update
EOF

run_update_step $((step_nr++)) $total_steps "Upgrading packages" <<EOF
apt-get upgrade -y
EOF

run_update_step $((step_nr++)) $total_steps "Removing old packages" <<EOF
apt-get autoremove -y
EOF

run_update_step $((step_nr++)) $total_steps "Updating snap packages" <<EOF
local snap_list=\$(snap refresh --list | cut -d' ' -f1 | tail -n +2)
for snap in \$snap_list; do
    local dot_count=0
    snap refresh "\$snap"&
    snap_pid=\$!
    while kill -0 "\$snap_pid" 2>/dev/null; do
        echo -n "Updating \$snap "
        for i in \$(seq 1 \$dot_count); do
            echo -n "."
        done
        echo ""        
        dot_count=\$((dot_count + 1))
        if [ \$dot_count -gt 30 ]; then
            dot_count=0
        fi
        sleep 1
    done    
done
EOF

run_update_step $((step_nr++)) $total_steps "Pruning docker images" <<EOF
export COMPOSE_MENU=0
docker compose down
docker image prune -f
EOF

run_update_step $((step_nr++)) $total_steps "Downloading latest release" <<EOF

# Unset -e
set +e

if [ -e ".FREEZE" ]; then
    echo "Update is frozen"
    exit 0
fi

if [ "$APP_VERSION" == "%APP_VERSION%" ] || [ "$APP_VERSION" == "development" ] || ["$GITHUB_REPO" == "%GITHUB_REPO%"]; then
    echo "Development version, skipping update"
    exit 0
fi

if [ -z "$GITHUB_REPO" ]; then
    echo "Please set the GITHUB_REPO variable in the script"
    exit 1
fi

if [ -z "$APP_VERSION" ]; then
    echo "Please set the APP_VERSION variable in the script"
    exit 1
fi

latest_release_json=\$(curl -fs "https://api.github.com/repos/$GITHUB_REPO/releases/latest")

if [ \$? -ne 0 ]; then
    echo "Failed to fetch latest release information"
    exit 1
fi

latest_version=\$(echo "\$latest_release_json" | jq -r '.tag_name')

if [ "\$latest_version" == "null" ] || [ -z \$latest_version ]; then
    echo "Failed to parse latest release information"
    exit 1
fi

if [ "\$latest_version" == "$APP_VERSION" ]; then
    echo "Up to date"
    exit 0
fi

echo "New version available: \$latest_version"

tmp_folder=\$(mktemp -d)
trap 'rm -rf \$tmp_folder' EXIT

for asset in \$(echo "\$latest_release_json" | jq -r '.assets[].browser_download_url'); do
    if [[ "\$(basename \$asset)" == *".tar.xz" ]]; then
        echo "Downloading \$asset"
        curl -f -L -o "\$tmp_folder/\$(basename \$asset)" "\$asset"
        if [ \$? -ne 0 ]; then
            echo "Failed to download \$asset"
            exit 1
        fi
    fi
done

if [ "\$(ls -A \$tmp_folder)" == "" ]; then
    echo "No assets found"
    exit 1
fi

tar -C "\$tmp_folder" -xJf "\$tmp_folder"/*.tar.xz
rm -rf "\$tmp_folder"/*.tar.xz

echo "Checking for required files"

if [ ! -e "\$tmp_folder/install.sh" ]; then
    echo "Required install.sh script not found"
    exit 1
fi

echo "Removing old version"

find . -mindepth 1 -maxdepth 1 ! -name 'volumes' -exec rm -rf {} +

echo "Installing new version"

chmod +x "\$tmp_folder/install.sh"
export DEBIAN_FRONTEND=noninteractive
"\$tmp_folder/install.sh"

echo "Done"
EOF

run_update_step $((step_nr++)) $total_steps "Pulling latest docker images" <<EOF
export COMPOSE_MENU=0
docker compose pull --policy=always
EOF

update_finished