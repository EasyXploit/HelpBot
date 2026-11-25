// Exports the event management function
export default async (message, locale) => {

    // Checks if the bot is ready to handle events
    if (!global.readyStatus) return;

    // Aborts if it is not an event from the base guild
    if (message.guild && message.guild.id !== client.baseGuild.id) return;

    // Prevents execution if the message was sent by a bot or the system
    if (message.author.bot || ![discord.MessageType.Default, discord.MessageType.Reply].includes(message.type)) return;

    // Creates an object in the client for user messages
    if (!client.userMessages) client.userMessages = {};

    // If the member does not have entry into the object of member messages, it creates it
    if (!client.userMessages[message.author.id]) client.userMessages[message.author.id] = {
        history: [],
        lastValidTimestamp: 0
    };

    // Creates a variable to store member's messages
    let userMessages = client.userMessages[message.author.id];

    // Stores the moderation module status
    const moderationModuleEnabled = await client.functions.db.getConfig('system.modules.moderation');

    // Stores whether automod is enabled (which requires the moderation module to be active)
    const automodEnabled = moderationModuleEnabled && await client.functions.db.getConfig('moderation.automodEnabled');

    // If the message has content
    if (automodEnabled && message.content.length > 0) {
        
        // A hash is generated from the content of the message
        const messageHash = await client.md5(message.content);

        // Adds the message to the member's messages
        userMessages.history.push({
            id: message.id,
            timestamp: message.createdTimestamp,
            editedTimestamp: message.editedTimestamp,
            channelId: message.channel.id,
            channelType: message.channel.type,
            content: message.content,
            hash: messageHash,
        });
    };
    
    // If the message has attachments and is wanted to be filtered
    if (automodEnabled && await client.functions.db.getConfig('moderation.filters.crossPost').filterFiles && message.attachments.size > 0) {

        // An array is generated from the values of the attachments
        const attachmentsArray = Array.from(message.attachments.values());

        // For each of the attachments
        for (let index = 0; index < attachmentsArray.length; index++) {

            // Stores the attachment
            const attachment = attachmentsArray[index];

            try {

                // Generates a hash from the content of the file, or from its name, size and type if it is too big to be downloaded (more than 25 MB)
                const attachmentHash = attachment.size > 25 * 1024 * 1024
                    ? await client.md5(`${attachment.name}:${attachment.size}:${attachment.contentType}`)
                    : await client.md5(Buffer.from(await (await fetch(attachment.proxyURL)).arrayBuffer()));

                // Adds the hash to the member's messages
                userMessages.history.push({
                    id: message.id,
                    timestamp: message.createdTimestamp,
                    editedTimestamp: message.editedTimestamp,
                    channelId: message.channel.id,
                    channelType: message.channel.type,
                    content: attachment.proxyURL,
                    hash: attachmentHash
                });

            } catch (error) {

                // Warns about the error, and continues with the next attachment
                logger.warn(`The attachment ${attachment.id} of the message ${message.id} could not be checked: ${error.message}`);
            };
        };
    };

    // If the moderation module is enabled
    if (automodEnabled) {

        // Stores the size of the member messages
        const messageHistorySize = await client.functions.db.getConfig('moderation.messageHistorySize');

        // While the history exceeds its size (a message can add several entries, one per attachment), eliminates its first element
        while (userMessages.history.length > messageHistorySize) userMessages.history.shift();
    };

    // Checks if the content of the message is allowed, if the moderation module is enabled
    const isPermitted = automodEnabled ? await client.functions.moderation.checkMessage(message) : true;

    // If it is a message sent on a guild and was not filtered
    if (message.member && isPermitted) {

        // Stores the engagement module status
        const engagementModuleEnabled = await client.functions.db.getConfig('system.modules.engagement');

        // If the engagement module is enabled
        if (engagementModuleEnabled) {

            // Stores the member's profile, or creates it
            let memberProfile = await client.functions.db.getData('profile', message.member.id) || await client.functions.db.genData('profile', { userId: message.member.id });
    
            // If the sent messages are counted
            if (await client.functions.db.getConfig('leveling.collectMessagesCount')) {

                // Increases the sent messages count of the member
                memberProfile.stats.messagesCount++;
                
                // Saves the new statistics of the member in the database
                await client.functions.db.setData('profile', message.member.id, memberProfile);
            };
    
            // Checks if the experience system is enabled
            const xpEnabled = await client.functions.db.getConfig('leveling.experienceSystemEnabled');

            // If the last message tha generated XP was more old than the established period, and the experience system is enabled
            if (xpEnabled && await client.functions.db.getConfig('leveling.rewardMessages') && ((message.createdTimestamp - userMessages.lastValidTimestamp) > await client.functions.db.getConfig('leveling.minimumTimeBetweenMessages'))) {
    
                // Updates the last timestamp of XP gaining
                userMessages.lastValidTimestamp = message.createdTimestamp;
    
                // Increases the amount of XP of the member
                await client.functions.leveling.addExperience(message.member, 'message', message.channel);
            };
        };
    };
};
