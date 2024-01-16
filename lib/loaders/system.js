// Imports the loaders
import { loadEmojis, loadCommands, loadIntervals, loadScheduledMessages } from 'helpbot/loaders';

// Exports a function to start the full load of the bot
export async function loadSystem(locale) {

    try {

        // Stores the base guild in memory
        client.baseGuild = await client.guilds.cache.get(await client.functions.db.getConfig('system.baseGuildId'));

        // Notifies that the load of the base guild has been completed
        logger.debug('Base guild loading completed');

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

        // Loads the configured timers
        await loadScheduledMessages();

        // Loads the voice states (if monitoring)
        if (await client.functions.db.getConfig('leveling.rewardVoice')) {

            // Stores the cache of voice states
            let voiceStates = client.baseGuild.voiceStates.cache;

            // Creates an object in the client for user voice states
            if (!client.usersVoiceStates) client.usersVoiceStates = {};

            // For each voice state
            voiceStates.forEach(async voiceState => {

                // Stores the member, if found
                const member = await client.functions.utils.fetch('member', voiceState.id);
                if (!member) return;

                // Checks whether can win XP or not in the channel
                if (member.user.bot || (voiceState.guild.afkChannelId && voiceState.channelId === voiceState.guild.afkChannelId)) {
                    if (client.usersVoiceStates[voiceState.id]) {

                        // Deletes the record of the member who has left the voice channel
                        delete client.usersVoiceStates[voiceState.id];
                    };
                    return;
                };

                // Creates the object of the voice state
                if (client.usersVoiceStates[voiceState.id]) client.usersVoiceStates[voiceState.id].channelId = voiceState.channelId
                else  {
                    client.usersVoiceStates[voiceState.id] = {
                        guild: voiceState.guild.id,
                        channelID: voiceState.channelId,
                        lastXpReward: Date.now()
                    };
                };
            });

            // Notifies the correct load of voice states
            logger.debug('Voice states loading completed');
        };

        // Indicates that the bot is ready to handle events
        global.readyStatus = true;

        // Notifies the correct load of the bot
        logger.info(`${await client.functions.utils.parseLocale(locale.loadedCorrectly, { botUsername: client.user.username })}\n`);

        // Shows the main menu
        await client.functions.menus.main();

    } catch (error) {

        // Sends an error message to the console
        logger.error(error.stack);
    };
};
