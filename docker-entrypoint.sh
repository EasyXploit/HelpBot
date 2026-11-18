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

# Executes the container command (CMD)
exec "$@"