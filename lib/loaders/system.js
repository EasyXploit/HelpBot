// Imports the loaders
import { loadEmojis, loadCommands, loadIntervals, loadScheduledMessages } from 'helpbot/loaders';

// Exports a function to start the full load of the bot
export async function loadSystem(locale) {

    try {

        // Stores the base guild in memory
        client.baseGuild = await client.guilds.cache.get(await client.functions.db.getConfig('system.baseGuildId'));

        // Notifies that the load of the base guild has been completed
        logger.debug('Base guild loading completed');

        // Stores whether all the members were loaded in the cache
        let membersLoaded = false;

        try {

            // Loads all the guild members in the cache (only once, as Discord limits this request to 1 every 30 seconds)
            await client.baseGuild.members.fetch();

            // Notifies the correct load of the members cache
            logger.debug('Members cache loading completed');

            // Stores that all the members were loaded
            membersLoaded = true;

        } catch (error) {

            // Notifies that the members cache could not be loaded
            logger.warn(`Could not load the members cache, so it will be retried in 30 seconds: ${error.message}`);

            // Retries the load once the Discord rate limit has expired
            setTimeout(() => client.baseGuild.members.fetch().catch(() => {}), 30000);
        };

        // Loads the custom emojis in the client
        await loadEmojis();

        // Loads the commands in memory
        await loadCommands();

        // Loads the presence of the bot
        await client.functions.managers.updatePresence();

        // Notifies the correct load of the presence
        logger.debug('Presence loading completed');

        // Loads the scripts that work at intervals
        await loadIntervals();
        
        // Loads the scheduled messages, if enabled
        if (await client.functions.db.getConfig('system.modules.scheduledMessages')) await loadScheduledMessages();

        // Loads the members that are in voice channels, so they earn XP for their voice time (if monitoring)
        if (await client.functions.db.getConfig('leveling.rewardVoice')) await client.functions.leveling.loadVoiceStates();

        // Prepares the recovery of the joins that happened while the bot was offline (only if all the members were loaded, and before handling events, so no member is handled twice)
        const joinsRecovery = membersLoaded ? await client.functions.managers.recoverWelcomes().catch(error => logger.error(error.stack)) : null;

        // Indicates that the bot is ready to handle events
        global.readyStatus = true;

        // Recovers the joins that happened while the bot was offline
        if (joinsRecovery) await joinsRecovery().catch(error => logger.error(error.stack));

        // Notifies the correct load of the bot
        logger.info(`${await client.functions.utils.parseLocale(locale.loadedCorrectly, { botUsername: client.user.username })}\n`);

        // Shows the main menu
        await client.functions.menus.main();

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
