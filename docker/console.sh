#!/bin/sh
# Opens the console of the bot, attaching to the TMUX session where it runs (available in the image as the "console" command)

# Uses a generic terminal type when the one received is missing or unknown in the image (as happens with the terminals of some graphical Docker managers), as TMUX can not start without it
if [ -z "$TERM" ] || [ "$TERM" = "dumb" ] || ! tput -T "$TERM" longname >/dev/null 2>&1; then
    export TERM=xterm
fi

# Shows how to leave the console without stopping the bot, if the session exists
if tmux has-session -t helpbot 2>/dev/null; then
    echo "Opening the console of the bot. To leave it without stopping the bot, press Ctrl+B and then D."
    sleep 1
    exec tmux -u attach -t helpbot
fi

# Shows an error if the bot is not running
echo "The console of the bot is not available, as the bot is not running."
exit 1
