#!/bin/bash

# This script is used to monitor the log files of the Meyton Shootmaster software.
# It will print the new lines of the log files to the console.
# These represent the shots that were fired per range.
# Meyton calls this feature "Schussprotokoll".

cd /var/shootmaster || exit 1

tail_count=0 # Number of files being tailed
tail_pid= # PID of the tail process

# Ensure tail is cleaned up on exit
cleanup() {
    # If a tail process is running, kill it
    if [ -n "$tail_pid" ]; then
        kill "$tail_pid" 2>/dev/null
        wait "$tail_pid" 2>/dev/null
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Main loop
while true; do
    # Get the current number of log files
    current_count=$(find . -maxdepth 1 -name "log.*.txt" | wc -l)

    # If the number of log files has changed, restart tail
    if [ "$current_count" -ne "$tail_count" ]; then

        # If a tail process is running, kill it
        if [ -n "$tail_pid" ]; then
            kill "$tail_pid" 2>/dev/null
            wait "$tail_pid" 2>/dev/null
        fi

        # Update the tail count and start a new tail process
        tail_count="$current_count"
        echo "LOG_RESET" # This is a signal for the log reader to reset its state
        tail -n+2 -q -f "$(find . -maxdepth 1 -name "log.*.txt" ! -name "log.0.txt")" &
        tail_pid=$!
    fi

    sleep 10s
done
