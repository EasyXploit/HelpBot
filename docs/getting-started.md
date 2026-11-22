# Getting started

HelpBot is published as a ready-to-use [Docker](https://www.docker.com/) image, so you do not need to download or build its code. It stores its configuration and data in a [MongoDB](https://www.mongodb.com/) database.

## Requirements
- A machine with **Docker** (and **Docker Compose**, for the [recommended option](#option-1-docker-compose-recommended)).
- An `amd64` or `arm64` processor.
- About 1 GB of free RAM for the bot, plus what MongoDB needs.

## Create the bot account
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications), log in if you are not already logged in, click **New Application**, and fill in the application details.
2. In the **Bot** section, click **Reset Token** and copy the token. Keep it secret: anyone with it can control your bot.
3. In the same section:
   - Turn off **Public Bot**, so nobody else can add your bot to their servers.
   - Turn on the three **Privileged Gateway Intents**: **Presence Intent**, **Server Members Intent** and **Message Content Intent**.

## Invite the bot to your server
1. In the Developer Portal, go to **OAuth2 > URL Generator**.
2. In **Scopes**, check `bot`. In **Bot Permissions**, check `Administrator`.
3. Open the **Generated URL** in your browser and choose your server.

> **Important:** the bot is designed to work in **only one server**. Once it is working in your server, it leaves any other server it is added to. If it is in several servers and none of them is yours yet, it asks you in its [console](console.md) which one to use, and leaves the rest.

If the bot is not in any server when it starts, it waits and shows this same invitation link in its console.

## Deploy with Docker
The bot image is published in the GitHub Container Registry as [`ghcr.io/easyxploit/helpbot`](https://github.com/EasyXploit/HelpBot/pkgs/container/helpbot), with two tags:
- `latest`: the stable version.
- `beta`: the development version.

Use the one that matches the branch of this documentation, as they work differently.

You can deploy it in two ways:
- **[Option 1: Docker Compose](#option-1-docker-compose-recommended) (recommended):** starts the bot together with its MongoDB database and a [Watchtower](https://github.com/nicholas-fedor/watchtower) instance that keeps it up to date.
- **[Option 2: only the bot image](#option-2-only-the-bot-image):** if you already have a MongoDB database.

### Option 1: Docker Compose (recommended)
1. **Create a folder** for the bot (for example, `helpbot`).
2. **Download these two files** into that folder (open each one and click the **Download raw file** button):
   - [`docker-compose.yml`](../docker-compose.yml)
   - [`.env.example`](../.env.example)
3. **Rename `.env.example` to `.env`** and fill it in:

   | Setting | Required | What to put |
   |---|---|---|
   | `DISCORD_TOKEN` | Yes | The token you copied when [creating the bot account](#create-the-bot-account). |
   | `DB_USERNAME` | Yes | A username of your choice for the database. It is created the first time the database starts. |
   | `DB_PASSWORD` | Yes | A password of your choice for that user. |
   | `DB_NAME` | Yes | The database name. It is already set to `helpbot`. |
   | `LOCALE` | No | The bot language: `en-US` (default), `es-ES`, `it`, `ro` or `zh-CN`. |
   | `HELPBOT_TAG` | No | The bot image tag: leave it empty for `latest` (the stable version), or use `beta`. |
   | `MONGO_IMAGE` | No | The MongoDB image (`mongo:7` by default). Use `mongo:4.4` if your processor does not support AVX instructions, which MongoDB 5 and later require. |
   | `AUTO_UPDATE` | No | `false` to disable automatic updates (enabled by default). |
   | `SENTRY_DSN` | No | The DSN of your [Sentry](https://sentry.io) project, if you want to send the bot errors to it. |
   | `SENTRY_TRACES_SAMPLE_RATE` | No | The share of performance traces sent to Sentry, from `0` to `1` (`1` by default). |

4. **Start it** by running `docker compose up -d` inside the folder. If you use a graphical Docker manager, create a project (or stack) from this `docker-compose.yml` file instead.

The first start takes a little longer, as Docker downloads the images and MongoDB prepares the database. Once it is running, the folder will also contain:
- `data/`: the local configuration file (`config.json`).
- `logs/`: the bot logs.
- `database/`: the MongoDB data.

### Option 2: only the bot image
If you already have a MongoDB database, you can run only the bot. Create a folder for its files and run this command inside it, with your own values:

```sh
docker run -d -it --name HelpBot --restart unless-stopped \
  -e DISCORD_TOKEN=your-bot-token \
  -e DB_TARGET=your-mongodb-address \
  -e DB_PORT=27017 \
  -e DB_AUTH_SOURCE=admin \
  -e DB_NAME=helpbot \
  -e DB_USERNAME=your-mongodb-user \
  -e DB_PASSWORD=your-mongodb-password \
  -v "$(pwd)/data:/app/data" \
  -v "$(pwd)/logs:/app/logs" \
  ghcr.io/easyxploit/helpbot:latest
```

Besides `DISCORD_TOKEN`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` and the optional `LOCALE`, `SENTRY_DSN` and `SENTRY_TRACES_SAMPLE_RATE` from the [table above](#option-1-docker-compose-recommended), the bot needs these settings to connect to your database:

| Setting | Required | What to put |
|---|---|---|
| `DB_TARGET` | Yes | The address of your MongoDB server. If it runs on the same machine, use the address of the machine, not `localhost` (inside the container, `localhost` is the container itself). |
| `DB_PORT` | Yes | The port of your MongoDB server (usually `27017`). |
| `DB_AUTH_SOURCE` | Yes | The database where the MongoDB user is defined (usually `admin`). |

To use the development version, replace `latest` with `beta` at the end of the command.

## Run without Docker
Docker is the recommended way, but you can also run the bot directly with [Node.js](https://nodejs.org/) 24 (the version used by the image), with a MongoDB server that it can reach.

1. **Download the code** of the version you want (the `master` branch for the stable version, or `beta` for the development version) and open its folder in a terminal.
2. **Install its dependencies** with `npm ci --omit=dev`.
3. **Create a `.env` file** in that folder with the same settings as with [only the bot image](#option-2-only-the-bot-image), and add `NODE_ENV=production`. If MongoDB runs on the same machine, here you can use `localhost` as `DB_TARGET`.
4. **Start the bot** with `npm start`. Its [console](console.md) is the terminal where it runs.

### Keep it running
The bot does not start again by itself when it stops, and it stops after installing an update from **Check for updates** (an option only available outside Docker), so the new version can be loaded. Inside Docker, the container starts it again; outside Docker, something else must do it.

As the bot's console needs an interactive terminal, the simplest way is to run it in a TMUX session, with a loop that starts it again whenever it stops:

```
tmux new-session -s helpbot 'while true; do npm start; echo "The bot has stopped. Starting it again in 5 seconds (press Ctrl+C to cancel)"; sleep 5; done'
```

- To leave the console without stopping the bot, press `Ctrl+B`, release both keys, and then press `D`. To open it again, run `tmux attach -t helpbot`.
- **Shutdown** stops the bot, and then the loop starts it again. To stop it for good, choose **Shutdown** and press `Ctrl+C` during the 5-second wait.
- Process managers like PM2 or systemd can also start the bot again, but they do not provide an interactive terminal, so you could not use its menus.

## First start
Open the bot's [console](console.md) to follow its first start:
1. If the bot is not in any server yet, it shows the invitation link and waits until you [add it to your server](#invite-the-bot-to-your-server).
2. If it is in several servers, it asks you which one to use.
3. When it is ready, it shows its **main menu**, from where you can [configure it](console.md#configure-the-bot).

## Updates
- **With Docker Compose**, Watchtower checks for a new version every minute and updates the bot automatically. To disable it, set `AUTO_UPDATE=false` in the `.env` file and run `docker compose up -d` again.
- **With only the bot image**, run `docker pull ghcr.io/easyxploit/helpbot:latest` (or `:beta`), remove the container with `docker rm -f HelpBot` and create it again with the same `docker run` command. Your files in `data/` and `logs/` are kept.
