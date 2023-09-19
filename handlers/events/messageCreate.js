// Exports the event management function
export default async (message, locale) => {

    // Checks if the bot is ready to handle events
    if (!global.readyStatus) return;

    // Aborts if it is not an event from the base guild
    if (message.guild && message.guild.id !== client.baseGuild.id) return;

    // Prevents execution if the message was sent by a bot or the system
    if (message.author.bot || message.type !== discord.MessageType.Default) return;

    // Creates an object in the client for user messages
    if (!client.userMessages) client.userMessages = {};

    // If the member does not have entry into the object of member messages, it creates it
    if (!client.userMessages[message.author.id]) client.userMessages[message.author.id] = {
        history: [],
        lastValidTimestamp: 0
    };

    // Creates a variable to store member's messages
    let userMessages = client.userMessages[message.author.id];

    // If the message has content
    if (message.content.length > 0) {
        
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
    if (await client.functions.db.getConfig('moderation.filters.crossPost').filterFiles && message.attachments.size > 0) {

        // An array is generated from the values of the attachments
        const attachmentsArray = Array.from(message.attachments.values());

        // For each of the attachments
        for (let index = 0; index < attachmentsArray.length; index++) {

            // Gets the file to which the URL proxy is directed
            await fetch(attachmentsArray[index].proxyURL).then(async (response) => {

                // Stores the body of the file in string format
                const attachmentBody = await response.text();

                // Generates a hash from the body of the file
                const attachmentHash = await client.md5(attachmentBody);

                // Adds the hash to the member's messages
                userMessages.history.push({
                    id: message.id,
                    timestamp: message.createdTimestamp,
                    editedTimestamp: message.editedTimestamp,
                    channelId: message.channel.id,
                    channelType: message.channel.type,
                    content: attachmentsArray[index].proxyURL,
                    hash: attachmentHash
                });
            });
        };
    };

    // Stores the size of the member messages
    const messageHistorySize = await client.functions.db.getConfig('moderation.messageHistorySize');

    // If the history is full, eliminates the first element of the array
    if (userMessages.history.length >= messageHistorySize) userMessages.history.shift();  

    // Checks if the content of the message is allowed
    const isPermitted = await client.functions.moderation.checkMessage(message);

    // If it is a message sent on a guild and was not filtered
    if (message.member && isPermitted) {

        // Stores the member's profile, or creates it
        let memberProfile = await client.functions.db.getData('profile', message.member.id) || await client.functions.db.genData('profile', { userId: message.member.id });

        // Increases the sent messages count of the member
        memberProfile.stats.messagesCount++;
        
        // Saves the new statistics of the member in the database
        await client.functions.db.setData('profile', message.member.id, memberProfile);

        // If the last message tha generated XP was more old than the established period
        if (await client.functions.db.getConfig('leveling.rewardMessages') && ((message.createdTimestamp - userMessages.lastValidTimestamp) > await client.functions.db.getConfig('leveling.minimumTimeBetweenMessages'))) {

            // Updates the last timestamp of XP gaining
            userMessages.lastValidTimestamp = message.createdTimestamp;

            // Increases the amount of XP of the member
            await client.functions.leveling.addExperience(message.member, 'message', message.channel);
        };
    };
};
