// Imports the system loader
import { loadSystem } from 'helpbot/loaders';

// Exports a function to load a new base guild
export async function newBaseGuild(guild) {

    try {

        // Resets some global configuration variables
        const baseGuildId = await client.functions.db.setConfig('system.baseGuildId', guild.id);
        await client.functions.db.setConfig('system.inviteCode', '');

        // Loads the base guild on memory
        client.baseGuild = await client.guilds.cache.get(baseGuildId);
        
        // Loads the configuration in memory and start the system
        await loadSystem(client.locale.lib.loaders.system);

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
