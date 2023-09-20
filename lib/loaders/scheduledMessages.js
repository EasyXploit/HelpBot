// Exports a function to load the scheduled messages
export async function loadTimedMessages() {

    // Aborts if the scheduled messages are disabled
    if (!await client.functions.db.getConfig('system.modules.scheduledMessages')) return;

    // Stores the scheduled messages configuration
    let configuredMessages = await client.functions.db.getConfig('scheduledMessages.configuredMessages');

    // Function to send scheduled messages
    async function sendMessage(messageConfig, channel) {

        // Omits this scheduled message if it was disabled
        if (!messageConfig.enabled) return;

        // Stores the day number of the week
        const actualWeekDay = new Date().getDay();

        // If doesn't have to be sent today, aborts
        if (!messageConfig.weekDays.includes(actualWeekDay)) return;

        // Stores the last delivery of this message
        const lastSentMsg = await client.functions.db.getData('sent', messageConfig.hash);

        // Stores whether or not has been found
        let msgFound = false;

        // If the scheduled message has been sent at least once
        if (lastSentMsg) {

            // If the minimum time interval has not been exceeded, aborts
            if ((Date.now() - lastSentMsg.lastSentTimestamp) < (messageConfig.interval - 1000)) return;

            // Looks for the last messages of the channel in search of a scheduled message that has not reached the minimum of subsequent messages
            const lastMessages = await channel.messages.fetch({ limit: messageConfig.minimumMessagesSinceLast });

            // Stores an array with the IDs of the messages
            const messagesIds = Array.from(lastMessages.keys());

            // For each message obtained
            for (let index = 0; index < lastMessages.size; index++) {

                // Stores the message
                const message = lastMessages.get(messagesIds[index]);

                // If the message was found, stops the loop and changes the status of the msgFound variable
                if (message.id === lastSentMsg.id) return msgFound = true;
            };
        };

        // If the message was found, aborts the delivery
        if (msgFound) return;

        // Generates the message to send
        const scheduledMessage = await client.functions.utils.assembleMessage({
            content: messageConfig.content,
            embed: messageConfig.embed,
            actionRows: messageConfig.actionRows
        });

        // Checks if the bot has permission to send messages on the channel
        const missingPermissions = await client.functions.utils.missingPermissions(channel, channel.guild.members.me, ['SendMessages', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory'], true);

        // If the bot did not have the necessary permissions
        if (missingPermissions) {

            // Disables the scheduled message
            messageConfig.enabled = false;

            // Updates the database with the changes
            await client.functions.db.setConfig('scheduledMessages.configuredMessages', configuredMessages);

            // Informs about the situation
            logger.warn('The bot didn\'t have sufficient permissions to send a scheduled message in its configured channel, so it has been disabled. The following permissions are needed: Send Messages, Embed Links, Attach Files and Read Message History');

            // Aborts the rest of the function
            return false;
        };

        // Sends the message to the specified channel
        const sentMsg = await channel.send(scheduledMessage);

        // Looks for the message previously sent in the database
        const previousMessage = await client.functions.db.getData('sent', messageConfig.hash);

        // If the scheduled message was previously sent
        if (previousMessage) {

            // Updates the database to save the ID of the last message sent
            await client.functions.db.setData('sent', messageConfig.hash, {
                messageId: sentMsg.id,
                lastSentTimestamp: Date.now()
            });

        } else {

            // Adds an entry to the database for this delivery
            await client.functions.db.genData('sent', {
                hash: messageConfig.hash,
                messageId: sentMsg.id,
                lastSentTimestamp: Date.now()
            });
        };
    };

    // For each of the scheduled messages configured
    for (let configuredMessage of configuredMessages) {

        // Omits this scheduled message if it was disabled
        if (!configuredMessage.enabled) return;

        // If still doesn't have a hash
        if (!configuredMessage.hash) {

            // Generates the message to include in the hash
            const scheduledMessage = await client.functions.utils.assembleMessage({
                content: configuredMessage.content,
                embed: configuredMessage.embed,
                actionRows: configuredMessage.actionRows
            });

            // Generates an object with everything needed for the hash
            const scheduledMessageData = {
                'channelId': configuredMessage.channelId,
                'interval': configuredMessage.interval,
                'weekDays': configuredMessage.weekDays,
                'minimumMessagesSinceLast': configuredMessage.minimumMessagesSinceLast,
                'message': scheduledMessage
            };

            // Generates a MD5 hash from the configuration of the scheduled message
            configuredMessage.hash = await client.md5(JSON.stringify(scheduledMessageData));

            // Updates the database with the changes
            await client.functions.db.setConfig('scheduledMessages.configuredMessages', configuredMessages);
        };

        // Looks for the channel specified in the message configuration
        const channel = await client.functions.utils.fetch('channel', configuredMessage.channelId);

        // Omits the iteration if cannot find the message
        if (!channel) continue;

        // Sends the message at least once
        sendMessage(configuredMessage, channel);

        // Programs an interval to send the scheduled message
        setInterval(async () => { sendMessage(configuredMessage, channel) }, configuredMessage.interval);
    };

    // Stores the scheduled messages sent
    const sentTimedMessaged = await client.functions.db.getData('sent');

    // For each of the sent messages
    for (const sent of sentTimedMessaged) {

        // If the associated configuration no longer exists
        if (!configuredMessages[sent.hash]) {

            // Deletes it from the database
            await client.functions.db.delData('sent', sent.hash);
        };
    };

    // Sends a notification to the console
    logger.debug('Timed messages loading completed');
};
