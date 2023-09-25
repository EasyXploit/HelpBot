// Exports the event management function
export default async (guild, locale) => {
    
    try {

        // Omits if the guild is property of the bot
        if (guild.ownerId === client.user.id) return;

        // Notifies the abandonment of the guild
        logger.debug(`The bot has been removed from \"${guild.name}\"`);

        // Loads the list of guilds to which the bot is linked
        const cachedGuilds = client.guilds.cache;

        // Loads the service guild Id
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

            // Help URLs to join the bot to a guild
            const joinNewGuildURL = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`;	
            const waitingNewGuildHelpURL = 'https://github.com/EasyXploit/HelpBot/wiki/Starting#-joining-the-bot';

            //  Shows the help URLs to join the bot to a guild
            console.log(`\n⏳ ${await client.functions.utils.parseLocale(locale.waitingNewGuildHeader, { botUsername: client.user.username })} ...`);
            console.log(`➕ ${await client.functions.utils.parseLocale(locale.joinNewGuildHelp, { joinNewGuildURL: joinNewGuildURL })}`);
            console.log(`❔ ${await client.functions.utils.parseLocale(locale.waitingNewGuildHelp, { waitingNewGuildHelpURL: waitingNewGuildHelpURL })}\n`);
        };

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
