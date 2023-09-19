// Exports the event management function
export default async (guild, locale) => {
    
    try {

        // Omits if the guild is property of the bot
        if (guild.ownerId === client.user.id) return;

        // Notifies the abandonment of the guild
        logger.debug(`The bot has been removed from \"${guild.name}\"`);

        // Loads the list of guilds to which the bot is linked
        const cachedGuilds = client.guilds.cache;

        // Loads the service guild ID
        const serviceGuildId = await client.functions.db.getConfig('system.serviceGuildId');

        // Stores the number of eligible guilds (excluding the service ones)
        const elegibleGuilds = await cachedGuilds.filter(guild => guild.id !== serviceGuildId);

        // Stores the eligible guilds count
        let elegibleGuildsCount = elegibleGuilds.size;
        
        // If there are no guilds
        if (elegibleGuildsCount === 0) {

            // Indicates that the bot is not ready to handle events
            global.readyStatus = false;

            // Notifies that the bot is waiting to be joined to a guild
            logger.warn('The bot must be joined to a guild in order to work, so the program will wait until it occurs');
        };

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
