// Imports the loaders
import { newBaseGuild, loadSystem } from 'helpbot/loaders';

// Exports the event management function
export default async (event, locale) => {

    try {
        
        // Loads the list of guilds to which the bot is joined
        const cachedGuilds = client.guilds.cache;

        // Show through the console a list of the guilds to which the bot is joined
        logger.debug('List of guilds the bot is attached to');
        await cachedGuilds.forEach(async guild => {
            logger.debug(`⤷ ${guild.name} (${guild.id})`);
        });

        // Loads the base guild Id
        let baseGuildId = await client.functions.db.getConfig('system.baseGuildId');

        // Stores a copy of the guilds that can be the base guild (so the guilds cache is not modified)
        let elegibleGuilds = cachedGuilds.clone();

        // If the bot is not joined to any guild
        if (elegibleGuilds.size === 0) {

            // Help URLs to join the bot to a guild
            const joinNewGuildURL = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`;	
            const waitingNewGuildHelpURL = client.functions.utils.docsURL('getting-started.md#invite-the-bot-to-your-server');

            // Notifies that the bot is waiting to be joined to a guild
            console.log(`\n⏳ ${await client.functions.utils.parseLocale(locale.waitingNewGuildHeader, { botUsername: client.user.username })} ...`);
            console.log(`➕ ${await client.functions.utils.parseLocale(locale.joinNewGuildHelp, { joinNewGuildURL: joinNewGuildURL })}`);
            console.log(`❔ ${await client.functions.utils.parseLocale(locale.waitingNewGuildHelp, { waitingNewGuildHelpURL: waitingNewGuildHelpURL })}\n`);
            
            // Finishes by sending a debug message to the console
            return logger.debug('Waiting for the bot to be joined to a guild');
        };

        // If the bot is joined to more than one guild
        if (elegibleGuilds.size > 1) {

            // Searches the base guild among the guilds the bot is joined to
            const baseGuild = elegibleGuilds.get(baseGuildId);

            // If the bot is joined to its base guild
            if (baseGuild) {

                // For each of the other guilds
                for (const guild of elegibleGuilds.values()) {

                    // Omits the base guild
                    if (guild.id === baseGuild.id) continue;

                    // Records that the bot will leave the guild, as it only works on its base guild (and the user may not be in that guild to kick it)
                    logger.warn(`The bot will leave the guild "${guild.name}" (${guild.id}), as it only works on its base guild "${baseGuild.name}" (${baseGuild.id})`);

                    // Leaves the guild
                    await guild.leave().catch(error => logger.error(error.stack));
                };

                // Keeps the base guild as the only eligible guild
                elegibleGuilds = elegibleGuilds.filter(guild => guild.id === baseGuild.id);

            } else {

                // Records that the bot cannot work in more than one guild
                logger.warn('User interaction was requested to choose which will be the new base guild, because the bot was in several guilds and none of them was the base guild');

                // Shows the base guild selector
                const newElegibleGuilds = await client.functions.menus.baseGuildSelection(elegibleGuilds);

                // Updated the listed of eligible guilds
                elegibleGuilds = newElegibleGuilds;
            };
        };

        // If there is no base guild, or the base guild is not the first on the list
        if (!baseGuildId || baseGuildId !== elegibleGuilds.first().id) {
            
            // Notifies through the console that a new base guild has been registered
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
