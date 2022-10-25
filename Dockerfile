FROM node:18.4.0-alpine

# Env variables
ENV NODE_ENV=production

# Create the bot's directory
RUN mkdir -p /usr/src/helpbot
WORKDIR /usr/src/helpbot

COPY ./package*.json /usr/src/helpbot
RUN npm install

# Installs FFMPEG
RUN apk update
RUN apk add
RUN apk add ffmpeg

COPY . /usr/src/helpbot

# Starts the bot.
CMD ["npm", "run", "devStart"]
