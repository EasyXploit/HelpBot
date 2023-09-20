// Function to manage the sending of records to the records channel
export default async (logType, contentType, content, attachments) => {

    try {

        // Stores the settings for this record
        const logSettings = await client.functions.db.getConfig(`logging.${logType}`);

        // If this record is not enabled, aborts
        if (!logSettings.enabled) return false;

        // Looks for the channel configured to send the record
        const logChannel = await client.functions.utils.fetch('channel', logSettings.channelId);

        // If the channel is not found
        if (!logChannel) {

            // Disables the record
            await client.functions.db.setConfig(`logging.${logType}.enabled`, false);

            // Deletes channel Id from the database
            await client.functions.db.setConfig(`logging.${logType}.channelId`, '');

            // Warns that the channel does not exist
            logger.warn(`Cannot access the ${logType} logging channel. The channel has been cleared from the configuration`);

            // Returns an incorrect state
            return false;
        };

        // Checks if the bot is missing permissions in the records channel
        const missingPermissions = await client.functions.utils.missingPermissions(logChannel, logChannel.guild.members.me, ['SendMessages', 'EmbedLinks', 'AttachFiles'], true);

        // If the bot missed permissions
        if (missingPermissions) {

            // Disables the record
            await client.functions.db.setConfig(`logging.${logType}.enabled`, false);

            // Warns through console that there are no permissions
            logger.warn(`Cannot send logs to the ${logType} logging channel. The bot must have the following permissions on the channel: ${missingPermissions}`);

            // Returns an incorrect state
            return false;
        };

        // Sends the content to the channel, depending on the type
        switch (contentType) {
            case 'embed': await logChannel.send({ embeds: [content], files: attachments ? attachments : [] }); break;
            case 'text': await logChannel.send({ text: [content], files: attachments ? attachments : [] }); break;
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