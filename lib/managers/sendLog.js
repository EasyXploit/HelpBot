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
            logChannel = await client.functions.utils.fetch('channel', logSettings.channelId);

            // If the channel is not found
            if (!logChannel) {

                // Deletes channel Id from the database, so the default channel is used
                await client.functions.db.setConfig(`logging.${logType}.channelId`, '');

                // Warns that the channel does not exist
                logger.warn(`Cannot access the ${logType} logging channel. The channel has been cleared from the configuration, so the default logging channel will be used instead`);
            };
        };

        // If the record has no channel, uses the default channel
        if (!logChannel) {

            // Stores the Id of the default channel
            const defaultChannelId = await client.functions.db.getConfig('logging.defaultChannelId');

            // If there is no default channel, aborts
            if (!defaultChannelId || defaultChannelId.length === 0) return false;

            // Looks for the default channel
            logChannel = await client.functions.utils.fetch('channel', defaultChannelId);

            // If the channel is not found
            if (!logChannel) {

                // Deletes channel Id from the database
                await client.functions.db.setConfig('logging.defaultChannelId', '');

                // Warns that the channel does not exist
                logger.warn('Cannot access the default logging channel. The channel has been cleared from the configuration');

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