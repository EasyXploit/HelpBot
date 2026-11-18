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

# Sets the Node.js runtime environment to production
ENV NODE_ENV=production

# Copies the manifest files and installs the dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copies the project code
COPY . .

# Stores a copy of the default local configuration
RUN mkdir defaults && cp config.json defaults/

# Initializes the persistent data before starting the application
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]

# Starts the application
CMD ["tmux", "new-session", "-s", "helpbot", "npm start"]