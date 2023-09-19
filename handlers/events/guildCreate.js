// Imports the loaders
import { newBaseGuild, loadSystem } from 'helpbot/loaders';

// Exports the event management function
export default async (guild, locale) => {
    
    try {

        // Omits if the guild is of the bot
        if (guild.ownerId === client.user.id) return;

        // List of guilds to which the bot is joined
        const cachedGuilds = client.guilds.cache;

        // Loads the service guild ID
        const serviceGuildId = await client.functions.db.getConfig('system.serviceGuildId');

        // Stores the number of eligible guilds (except the service one)
        let elegibleGuilds = await cachedGuilds.filter(guild => guild.id !== serviceGuildId);

        // Stores the eligible guilds count
        let elegibleGuildsCount = elegibleGuilds.size;

        // Checks how many guilds are available
        if (elegibleGuildsCount === 1) {

            // Notifies through the console that the bot has joined the guild
            logger.debug(`The bot has been joined to "${guild.name}" (${guild.id})`);

            // Stores the new guild configuration
            await newBaseGuild(cachedGuilds.first());

        } else {

            // Indicates that the bot is not ready to handle events
            global.readyStatus = false;

            // Records that the bot cannot work in more than one guild
            logger.warn('User interaction was requested to choose which will be the new base guild, because the bot was added to a new guild. Meanwhile, the bot will not be able to handle events');

            // Shows the base guild selector
            const newElegibleGuilds = await client.functions.menus.baseGuildSelection(elegibleGuilds);

            // Updates the list of eligible guilds
            elegibleGuilds = newElegibleGuilds;

            // Loads the base guild ID
            const baseGuildId = await client.functions.db.getConfig('system.baseGuildId');

            // If there is no base guild, or the base guild is not the first on the list
            if (baseGuildId !== elegibleGuilds.first().id) {
                
                // Notifies through the console that a new base guild has been registered
                logger.debug(`A new base guild has been registered: ${elegibleGuilds.first().name} (${elegibleGuilds.first().id})`);

                // Records a new base guild
                await newBaseGuild(elegibleGuilds.first());

            } else {

                // Loads the configuration in memory and starts the system
                await loadSystem(client.locale.lib.loaders.system);
            };
        };

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
