// Imports the loaders
import { newBaseGuild, loadSystem } from 'helpbot/loaders';

// Help URL to join the bot to a guild
const waitingNewGuildHelpURL = 'https://github.com/EasyXploit/HelpBot/wiki/Starting#-joining-the-bot';

// Exports the event management function
export default async (event, locale) => {

    try {
        
        // Loads the list of guilds to which the bot is joined
        const cachedGuilds = client.guilds.cache;

        // Show by console a list of the guilds to which the bot is joined
        logger.debug('List of guilds the bot is attached to');
        await cachedGuilds.forEach(async guild => {
            logger.debug(`⤷ ${guild.name} (${guild.id})`);
        });

        // Loads the base guild ID
        let baseGuildId = await client.functions.db.getConfig('system.baseGuildId');

        // Loads the service guild ID
        const serviceGuildId = await client.functions.db.getConfig('system.serviceGuildId');

        // Stores the number of eligible guilds (excluding the service ones)
        let elegibleGuilds = await cachedGuilds.filter(guild => guild.id !== serviceGuildId);

        // Stores the eligible guilds count
        let elegibleGuildsCount = elegibleGuilds.size;
        
        // Checks how many guilds are available
        if (elegibleGuildsCount > 1) { // If the amount is greater than 1

            // For each guild in cache
            await elegibleGuilds.forEach(async guild => {

                // If the guild is from the bot
                if(guild.ownerId === client.user.id) {

                    try {

                        // Decrements the eligible guilds count
                        elegibleGuildsCount--;
    
                        // Deletes the guild
                        return await guild.delete();
                        
                    } catch (error) {

                        // Shows an error in the console
                        logger.error(error.stack);
                    };
                };
            });

        } else if (elegibleGuildsCount === 0) { // If the amount is 0

            // Notifies that the bot is waiting to be joined to a guild
            console.log(`\n⏳ ${await client.functions.utils.parseLocale(locale.waitingNewGuildHeader, { botUsername: client.user.username })} ...`);
            console.log(`❔ ${await client.functions.utils.parseLocale(locale.waitingNewGuildHelp, { waitingNewGuildHelpURL: waitingNewGuildHelpURL })}\n`);
            
            // Finishes by sending a debug message to the console
            return logger.debug('Waiting for the bot to be joined to a guild');
        };

        // If the eligible guilds count is exactly 1
        if (elegibleGuildsCount !== 1) {

            // Records that the bot cannot work in more than one guild
            logger.warn('User interaction was requested to choose which will be the new base guild, because the bot was in several guilds');

            // Shows the base guild selector
            const newElegibleGuilds = await client.functions.menus.baseGuildSelection(elegibleGuilds);

            // Updated the listed of eligible guilds
            elegibleGuilds = newElegibleGuilds;
        };

        // If there is no base guild, or the base guild is not the first on the list
        if (!baseGuildId || baseGuildId !== elegibleGuilds.first().id) {
            
            // Notifies by console that a new base guild has been registered
            logger.debug(`A new base guild has been registered: ${elegibleGuilds.first().name} (${elegibleGuilds.first().id})`);

            // Records a new base guild
            await newBaseGuild(elegibleGuilds.first());

        } else {

            // Loads the configuration in memory and starts the system
            await loadSystem(client.locale.lib.loaders.system);
        };

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
