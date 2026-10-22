# Bases the image on the official Node.js 24 slim image with Debian Bookworm
FROM node:24-bookworm-slim

# Installs the necessary dependencies for the application
RUN apt-get update && apt-get install -y --no-install-recommends \
    tmux \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Sets the working directory for the application
WORKDIR /app

# Copies the manifest files and installs the dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copies the project code
COPY . .

# Starts the application
CMD ["tmux", "new-session", "-s", "helpbot", "npm start"]