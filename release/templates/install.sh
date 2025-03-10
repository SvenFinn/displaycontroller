#!/bin/bash

set -o pipefail

APP_VERSION="%APP_VERSION%"
BACK_TITLE="Displaycontroller Installation ${APP_VERSION}"

function run_install_step(){
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

    local width=`tput cols`
    local height=`tput lines`

    local bar_height=2
    local bar_top=$(( height - bar_height - 3 ))
    local bar_width=$(( width - 6 ))
    local bar=$(for i in $(seq 1 $(((step-1)*bar_width/(total_steps-1)))); do echo -n "\Z4\Zr \Zn"; done)

    local command_top=2
    local command_height=$(( bar_top - command_top - 3 ))

    local tmp_log_file=$(mktemp)

    if [ "$DEBIAN_FRONTEND" == "noninteractive" ]; then
        eval "$command" 2>&1 | tee $tmp_log_file
    else
        eval "$command" 2>&1 | tee $tmp_log_file | dialog --colors --keep-window --backtitle "$BACK_TITLE" \
                                                --begin $bar_top 0 --title "Step $step of $total_steps: $step_title" --infobox "$bar" $bar_height $width \
                                                --and-widget --keep-window --begin $command_top 0 --title "$step_title" --progressbox $command_height $width
    fi

    local EXIT_CODE=$?

    if [ $EXIT_CODE -ne 0 ]; then
        if [ "$DEBIAN_FRONTEND" == "noninteractive" ]; then
            echo "ERROR: $step_title"
            cat $tmp_log_file
            exit 1
        fi

        local error_top=2
        local error_height=3

        local reboot_height=7
        local reboot_top=$(( height - reboot_height - 3 ))

        local log_top=$(( error_top + error_height + 3 ))
        local log_height=$(( reboot_top - log_top - 3 ))

        local error_message="Bei der Durchführung der Installation ist ein Fehler aufgetreten. Die Installation wurde abgebrochen."

        local dialog_options=(
            --colors --keep-window --backtitle "$BACK_TITLE"
            --begin $error_top 0 --title "\Z1ERROR\Zn" --infobox "\Z1\Zb$error_message\Zn" 3 $width
            --and-widget --keep-window --colors --begin $log_top 0 --title "\Z1Log: $step_title\Zn" --progressbox "$command_with_newlines" $log_height $width
        )
        cat $tmp_log_file | dialog "${dialog_options[@]}" --and-widget --keep-window --colors --begin $reboot_top 0 --msgbox "" $reboot_height $width

        rm $tmp_log_file
        tput cnorm

        exit

    fi

    sleep 1

    rm $tmp_log_file
    tput cnorm

}

function install_finished(){

    if [ "$DEBIAN_FRONTEND" == "noninteractive" ]; then
        echo "Installation finished successfully."
        exit 0
    fi

    local width=`tput cols`
    local height=`tput lines`

    local success_top=2
    local success_height=7


    local reboot_height=7
    local reboot_top=$(( height - reboot_height - 3 ))

    local autostart_text=""
    if [ $AUTOSTART -eq 1 ]; then
        autostart_text="\nThe Displaycontroller will start on boot."
    fi

    dialog_options=(
        --colors --backtitle "$BACK_TITLE"
        --begin $success_top 0 --title "\Z2Installation finished\Zn" --msgbox "The installation was finished successfully.\n\nThe Displaycontroller can be started from the application menu.$autostart_text" $success_height $width
    ) 

    dialog "${dialog_options[@]}" 

    exit 0
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

# Check if dialog is installed
if ! command -v dialog &> /dev/null; then
    apt-get update
    apt-get install -y dialog
fi

SRC_DIR="$(realpath "$(dirname "$0")")"
INSTALL_DIR=$(pwd)
USER=${$SUDO_USER:-$(id -nu $PKEXEC_UID)}


# Check if the DisplayController.desktop file exists in the users autostart directory
AUTOSTART=0
if [ -f "/home/$USER/.config/autostart/DisplayController.desktop" ]; then
    AUTOSTART=1
fi

if [ "$DEBIAN_FRONTEND" != "noninteractive" ]; then

    width=$(tput cols)
    height=$(tput lines)

    
    # Allow the user to choose the installation directory
    INSTALL_DIR=$(dialog --stdout --backtitle "$BACK_TITLE" --begin 3 0 --title "Welcome" --infobox "Welcome to the DisplayController installation script.\n\nThis script will guide you through the installation process." 5 $width \
        --and-widget --title "Installation directory" --inputbox "Please enter the installation directory" 0 $width "/opt/displaycontroller")
    if [ $? -ne 0 ]; then
        exit
    fi

    # Allow the user to choose if the DisplayController should start on boot
    dialog --stdout --backtitle "$BACK_TITLE" --title "Start on boot" --yesno "Do you want the DisplayController to start on boot?" 0 $width
    if [ $? -eq 0 ]; then
        AUTOSTART=1
    else 
        AUTOSTART=0
    fi
fi

# Run the installation steps
total_steps=5
step_nr=1

run_install_step $((step_nr++)) $total_steps "Installing Files" <<EOF
mkdir -p "$INSTALL_DIR" 
find "$INSTALL_DIR" -mindepth 1 -maxdepth 1 ! -name 'volumes' -exec rm -rfv {} +
find "$SRC_DIR" -mindepth 1 -maxdepth 1 -exec cp -rv {} "$INSTALL_DIR" \;
find "$INSTALL_DIR" -type f -name "*.sh" -exec chmod -v +x {} \;
EOF

run_install_step $((step_nr++)) $total_steps "Creating links" <<EOF
cat << EOT > "$INSTALL_DIR/DisplayController.desktop"
[Desktop Entry]
Version=$APP_VERSION
Name=DisplayController
Comment=Start the DisplayController
Exec=gnome-terminal --full-screen -- $INSTALL_DIR/start.sh
Type=Application
Icon=$INSTALL_DIR/icon.png
Terminal=true
Path=$INSTALL_DIR
Categories=Utility;WebBrowser;
EOT
chmod -v +x "$INSTALL_DIR/DisplayController.desktop"

rm -f "/usr/share/applications/DisplayController.desktop" || true
ln -sf "$INSTALL_DIR/DisplayController.desktop" "/usr/share/applications/DisplayController.desktop"
echo "Linked DisplayController.desktop to /usr/share/applications/DisplayController.desktop"
update-desktop-database -v /usr/share/applications

if [ $AUTOSTART -eq 1 ]; then
    mkdir -p "/home/$USER/.config/autostart"
    rm -f "/home/$USER/.config/autostart/DisplayController.desktop" || true
    ln -s "$INSTALL_DIR/DisplayController.desktop" "/home/$USER/.config/autostart/DisplayController.desktop"
    echo "Linked DisplayController.desktop to /home/$USER/.config/autostart/DisplayController.desktop"
fi
EOF

run_install_step $((step_nr++)) $total_steps "Installing Docker" <<EOF
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

# Add Docker's official GPG key:
apt-get update
apt-get install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update

apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

groupadd docker || true
usermod -aG docker $USER
EOF

run_install_step $((step_nr++)) $total_steps "Installing Dependencies" <<EOF
apt-get update
apt-get install -y chromium-browser unclutter
EOF

run_install_step $((step_nr++)) $total_steps "Pulling latest docker images" <<EOF
cd "$INSTALL_DIR"
export COMPOSE_MENU=0
docker compose pull
EOF

install_finished