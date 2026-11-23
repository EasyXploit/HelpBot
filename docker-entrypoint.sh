#!/bin/sh
# Initializes the persistent data and starts the application
set -e

# Creates the local configuration file from the default one if it does not exist yet
if [ ! -f /app/data/config.json ]; then
    mkdir -p /app/data
    cp /app/defaults/config.json /app/data/config.json
    echo "Copied default file: data/config.json"
fi

# Links the local configuration file to the persistent data folder
ln -sf /app/data/config.json /app/config.json

# In Docker Compose, fills the empty database settings of the local configuration with the MongoDB service of the project (and a random password)
if [ "$GENERATE_DATABASE_CONFIG" = "true" ]; then
    node /app/docker-database.js
fi

# Disables the exit on error from here on, as the wait below is interrupted by the stop signals on purpose
set +e

# Starts the application (CMD) inside a detached TMUX session, so its menus can be accessed with "tmux attach -t helpbot", keeping the session open after it exits to read its exit code, and sends its output to the container logs
tmux start-server \; set-option -g remain-on-exit on \; new-session -d -s helpbot -x 200 -y 50 "exec $*" \; pipe-pane -t helpbot -o 'cat >> /proc/1/fd/1'

# Stores the process ID of the application
APP_PID=$(tmux display-message -p -t helpbot '#{pane_pid}')

# Forwards the stop signals (sent when stopping or updating the container) to the application, so it can shut down gracefully
trap 'kill -TERM "$APP_PID" 2>/dev/null' TERM INT

# Waits while the application is running
while [ "$(tmux display-message -p -t helpbot '#{pane_dead}' 2>/dev/null || echo 1)" != "1" ]; do sleep 1 & wait $!; done

# Stores the exit code of the application and closes TMUX
EXIT_CODE=$(tmux display-message -p -t helpbot '#{pane_dead_status}' 2>/dev/null)
tmux kill-server 2>/dev/null

# Exits with the same code as the application
exit "${EXIT_CODE:-1}"