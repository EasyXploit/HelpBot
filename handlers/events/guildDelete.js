// Imports the function to stop the intervals
import { stopAllIntervals } from '../../lib/loaders/intervals.js';

// Exports the event management function
export default async (guild, locale) => {
    
    try {

        // Notifies the abandonment of the guild
        logger.debug(`The bot has been removed from \"${guild.name}\"`);

        // Loads the list of guilds to which the bot is linked
        const cachedGuilds = client.guilds.cache;

        // If there are no guilds
        if (cachedGuilds.size === 0) {

            // Indicates that the bot is not ready to handle events
            global.readyStatus = false;

            // Stops the intervals, as there is no guild to work with
            stopAllIntervals();

            // If there is a current prompt, it is canceled
            if (global.currentPrompt && global.currentPrompt.cancel) global.currentPrompt.cancel();
            
            // Notifies that the bot is waiting to be joined to a guild
            logger.warn('The bot must be joined to a guild in order to work, so the program will wait until it occurs');

            // Help URLs to join the bot to a guild
            const joinNewGuildURL = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`;	
            const waitingNewGuildHelpURL = client.functions.utils.docsURL('getting-started.md#invite-the-bot-to-your-server');

            // Shows the help URLs to join the bot to a guild
            console.log(`\n⏳ ${await client.functions.utils.parseLocale(locale.waitingNewGuildHeader, { botUsername: client.user.username })} ...`);
            console.log(`➕ ${await client.functions.utils.parseLocale(locale.joinNewGuildHelp, { joinNewGuildURL: joinNewGuildURL })}`);
            console.log(`❔ ${await client.functions.utils.parseLocale(locale.waitingNewGuildHelp, { waitingNewGuildHelpURL: waitingNewGuildHelpURL })}\n`);
        };

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
