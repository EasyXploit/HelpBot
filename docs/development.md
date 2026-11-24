# Development

The repository includes a development container for [Visual Studio Code](https://code.visualstudio.com), so the bot can be run and debugged inside Docker, with its own MongoDB database, on any computer.

## Requirements
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (or Docker Engine on Linux), running.
- Visual Studio Code with the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.
- A Discord bot for development, different from the production one. If both use the same token, they are connected at the same time and both respond.

## Set up a computer
This is done once on each computer:
1. **Copy `.devcontainer/.env.example` as `.devcontainer/.env`** and fill it in if you want: all its settings are optional. If you leave the token of the development bot empty, the bot asks for it in its console the first time it runs on that computer. This file is not uploaded to Git.
2. **Open the repository folder** in Visual Studio Code and choose **Reopen in Container** when it is offered (or run **Dev Containers: Reopen in Container** from the command palette).

The first time takes a little longer, as Docker downloads the images and installs the dependencies.

## Run the bot
From the **Run and Debug** view, start one of these configurations:
- **Desarrollo**: restarts the bot when a file is saved.
- **Producción**: runs the bot as in production.

The bot console, with its menus, opens in the integrated terminal.

## Development configuration
Inside the container, the bot uses its own local configuration file, `.devcontainer/data/config.json`, instead of the `config.json` of the repository, so testing does not change it. It is created as a copy of `config.json` the first time, and it is not uploaded to Git.

## Development database
The bot takes care of the database of the container: on the first start, it stores in `.devcontainer/data/config.json` the name and user `helpbot` and a random password, and the database creates its user with them. To choose them yourself, or to use a MongoDB of your own, fill them in `.devcontainer/.env` (or in that file) before the first start. The ones of `.devcontainer/.env` take precedence.

The database is kept in a Docker volume, separated from any other database, so it survives when the container is rebuilt. To start from scratch, stop the container and remove the volume whose name ends in `_database` from Docker Desktop, along with `.devcontainer/data/config.json` (as the database only creates its user on its first start).
