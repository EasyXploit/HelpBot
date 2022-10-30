# Será neecsario ajustar las composiciones en función del entorno
# https://docs.docker.com/compose/production/

# Node.js image to be used
FROM node:18.4.0-alpine

# Environment variables
ENV NODE_ENV=production

# Creates the bot's directory
RUN mkdir -p /usr/src/helpbot
WORKDIR /usr/src/helpbot

# Downloads all the dependencies
COPY ./package*.json /usr/src/helpbot
RUN npm install

# Installs FFMPEG
RUN apk update
RUN apk add
RUN apk add ffmpeg

# Copies the rest of the bot's code
COPY . /usr/src/helpbot

# Starts the bot (pendiente de revisar)
CMD ["npm", "run", "dockerDevStart"]
