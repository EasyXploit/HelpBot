// Function to look for a channel, which returns "null" if it no longer exists, and "undefined" if it could not be obtained for another reason (like a temporary error of Discord)
async function fetchChannel(channelId) {

    try {

        // Looks for the channel, and returns it
        return await client.baseGuild.channels.fetch(channelId);

    } catch (error) {

        // If the channel no longer exists, returns "null"
        if (error.code === discord.RESTJSONErrorCodes.UnknownChannel) return null;

        // Otherwise, warns about the error and returns "undefined"
        logger.warn(`The channel ${channelId} could not be obtained: ${error.message}`);
        return undefined;
    };
};

// Function to manage the sending of records to the records channel
export default async (logType, contentType, content, attachments) => {

    try {

        // Stores the settings for this record
        const logSettings = await client.functions.db.getConfig(`logging.${logType}`);

        // If this record is not enabled, aborts
        if (!logSettings || !logSettings.enabled) return false;

        // Stores the channel to send the record
        let logChannel = null;

        // If the record has its own channel
        if (logSettings.channelId && logSettings.channelId.length > 0) {

            // Looks for the channel of the record
            logChannel = await fetchChannel(logSettings.channelId);

            // If the channel could not be obtained for a reason other than not existing, aborts (so the configuration is not lost due to a temporary error)
            if (logChannel === undefined) return false;

            // If the channel no longer exists
            if (!logChannel) {

                // Deletes channel Id from the database, so the default channel is used
                await client.functions.db.setConfig(`logging.${logType}.channelId`, '');

                // Warns that the channel does not exist
                logger.warn(`The ${logType} logging channel no longer exists. The channel has been cleared from the configuration, so the default logging channel will be used instead`);
            };
        };

        // If the record has no channel, uses the default channel
        if (!logChannel) {

            // Stores the Id of the default channel
            const defaultChannelId = await client.functions.db.getConfig('logging.defaultChannelId');

            // If there is no default channel, aborts
            if (!defaultChannelId || defaultChannelId.length === 0) return false;

            // Looks for the default channel
            logChannel = await fetchChannel(defaultChannelId);

            // If the channel could not be obtained for a reason other than not existing, aborts (so the configuration is not lost due to a temporary error)
            if (logChannel === undefined) return false;

            // If the channel no longer exists
            if (!logChannel) {

                // Deletes channel Id from the database
                await client.functions.db.setConfig('logging.defaultChannelId', '');

                // Warns that the channel does not exist
                logger.warn('The default logging channel no longer exists. The channel has been cleared from the configuration');

                // Returns an incorrect state
                return false;
            };
        };

        // Checks if the bot is missing permissions in the records channel
        const missingPermissions = await client.functions.utils.missingPermissions(logChannel, logChannel.guild.members.me, ['SendMessages', 'EmbedLinks', 'AttachFiles'], true);

        // If the bot missed permissions
        if (missingPermissions) {

            // Warns through console that there are no permissions
            logger.warn(`Cannot send logs to the ${logType} logging channel (#${logChannel.name}). The bot must have the following permissions on the channel: ${missingPermissions}`);

            // Returns an incorrect state
            return false;
        };

        // Sends the content to the channel, depending on the type
        switch (contentType) {
            case 'embed': await logChannel.send({ embeds: [content], files: attachments ? attachments : [] }); break;
            case 'text': await logChannel.send({ content: content, files: attachments ? attachments : [] }); break;
            case 'file': await logChannel.send({ files: [content] }); break;
            default: return false;
        };

    } catch (error) {

        // Shows an error through the console
        logger.error(error.stack);

        // Returns an erroneous state
        return false;
    };

    // Returns a correct state
    return true;
};