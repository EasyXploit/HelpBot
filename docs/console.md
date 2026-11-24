# Console and configuration

HelpBot is configured from an interactive menu in its console. When it runs in Docker, that console is inside a TMUX session called `helpbot`, within the `HelpBot` container.

## Open the console
The image includes the `console` command, which opens it. Use one of these ways:
- **From a terminal:** `docker exec -it HelpBot console`
- **From a graphical Docker manager:** run the `console` command in the `HelpBot` container. Most managers have an option to run a command in a container (for example, **Terminal > Create > Run command**), or you can open a terminal in it and type `console`.

To leave the console without stopping the bot, press `Ctrl+B`, release both keys, and then press `D`. Closing the terminal window does not stop the bot either.

> In versions before 9.0.0-beta.2, which do not include the `console` command, open a terminal in the container and type `TERM=xterm tmux -u attach -t helpbot`.

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
