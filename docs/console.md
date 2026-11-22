# Console and configuration

HelpBot is configured from an interactive menu in its console. When it runs in Docker, that console is inside a TMUX session called `helpbot`, within the `HelpBot` container.

## Open the console
Use one of these ways:
- **From a terminal:** `docker exec -it HelpBot tmux attach -t helpbot`
- **From a graphical Docker manager:** open a terminal in the `HelpBot` container and type `tmux attach -t helpbot`

> If you get the error `missing or unsuitable terminal`, use `TERM=xterm tmux attach -t helpbot` instead.

## Use the menus
Move with the arrow keys and press `Enter` to choose an option. The main menu offers these options (their names depend on the bot language):

| Option | What it does |
|---|---|
| ⚙️ **Configure** | Opens the bot settings (see [below](#configure-the-bot)). |
| 📄 **Show logs** | Shows the bot logs. |
| ❓ **View information** | Shows information about the bot, your server and the database. |
| ⚖️ **View license** | Shows the bot license. |
| 🔄 **Restart** | Restarts the bot (the container stops it and starts it again). |

## Configure the bot
From **Configure** you can manage the bot modules, grouped in these sections:
- 🔧 **General configuration**
- ⚖️ **Moderation**
- 💬 **Engagement**
- 👋 **Greetings**
- 📊 **Polls**
- 🛠️ **Utilities**
- 🕒 **Scheduled messages**

In each section (except **General configuration**) you can **enable or disable the module**. The changes are saved in the database, so they are kept when the bot restarts or updates.

## Leave the console
To leave the console **without stopping the bot**, press `Ctrl+B`, release both keys, and then press `D`.

> Avoid pressing `Ctrl+C` inside the console, as it can close the menu or stop the bot.
