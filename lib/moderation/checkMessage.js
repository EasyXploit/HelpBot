// Function to check the content of the messages sent
export default async (message) => {
        
    // Omits if the author of the message is the owner of the guild
    if (message.author.id === client.baseGuild.ownerId) return true;

    // Stores the translations
    const locale = client.locale.lib.moderation.checkMessage;

    // Loads the automod filters
    let filters = await client.functions.db.getConfig('moderation.filters');

    // Turns the filters to an array
    filters = Object.entries(filters).map((filter) => ( { [filter[0]]: filter[1] } ));

    // Stores if the message is allowed
    let isPermitted = true;

    // Stores the URL of the filtered attachment
    let filteredURL;

    // For each of the automod filters
    filtersLoop: for (const filterIndex in filters) {

        // Stores the name of the filter
        const filterName = Object.keys(filters[filterIndex])[0];

        // Stores the filter configuration
        const filterCfg = filters[filterIndex][filterName];

        // Omits if it is disabled
        if (!filterCfg.status) continue;

        // If the filter works in DMs, it is a direct message and its use is disabled, omits
        if (message.channel.type === discord.ChannelType.DM && (!filterCfg['onDM'] || filterCfg.onDM === false)) continue;

        // Stores the roles, members and channels that it does not affect
        const bypassIds = filterCfg.bypassIds;

        // Omits if the channel has the filter deactivated
        if (message.channel && bypassIds.includes(message.channel.id)) continue;

        // Omits whether the member or any of his roles has the filter deactivated
        for (let index = 0; index < bypassIds.length; index++) if (message.member.id === bypassIds[index] || message.member.roles.cache.has(bypassIds[index])) continue filtersLoop;

        // Stores if a filter has been triggered
        let match;

        // Depending on the iterated filter
        switch (filterName) {

            // Filter of channel flooding
            case 'flood':

                // Creates an object in the client for user messages
                if (!client.userMessages) client.userMessages = {};

                // Stores the member's message history
                const history = client.userMessages[message.member.id] ? client.userMessages[message.member.id].history : [];

                // Omits if the history is not broad enough
                if (history.length < filterCfg.triggerLimit) break;

                // Stores a message count until reaching the top
                let matchesCount = 0;

                // Iterates the messages history until the alarm limit
                for (let index = 0; index <= filterCfg.triggerLimit; index++) {

                    // Stores the iterated message, and the previous one
                    const iteratedMessage = history[history.length - index - 1];
                    const previousMessage = history[history.length - index - 2];
                    
                    // If the acceptance threshold is not exceeded, it increases the count, but if overcomes it, omits the loop  
                    if (previousMessage && iteratedMessage.timestamp - previousMessage.timestamp < filterCfg.maxTimeBetween) matchesCount++;
                    else break;
                };

                // If the limit is exceeded or equals, propagates the coincidence
                if (matchesCount >= filterCfg.triggerLimit) match = true;

                // Stops the switch
                break;

            // Flood filter of several channels with the same message
            case 'crossPost':

                // Creates an object in the client for user messages
                if (!client.userMessages) client.userMessages = {};

                // Stores the member's message history
                const messagesHistory = client.userMessages[message.member.id] ? client.userMessages[message.member.id].history : [];

                // Omits if the history is not broad enough
                if (messagesHistory.length < filterCfg.triggerLimit) break;

                // Stores a message count until the top is reached
                let matches = 0;

                // Itera the mess history to the alarm limit
                for (let index = 0; index <= filterCfg.triggerLimit; index++) {

                    // Stores the iterated message, and the previous one
                    const iteratedMessage = messagesHistory[messagesHistory.length - index - 1];
                    const previousMessage = messagesHistory[messagesHistory.length - index - 2];

                    // If you do not exceed the acceptance threshold and there is a previous message
                    if (previousMessage && iteratedMessage.hash === previousMessage.hash) {

                        // Increases the coincidence count
                        matches++;

                        // Stores the content of the filtered message
                        filteredURL = iteratedMessage.content;

                    } else if (index === 0) break; // If not, and it is the first message, omits the loop
                };

                // If the limit is exceeded or equals, propagates the coincidence
                if (matches >= filterCfg.triggerLimit) match = true;

                // Stops the switch
                break;

            // Filter of bad words
            case 'bannedWords':

                // Stores the forbidden words
                const bannedWords = await client.functions.db.getConfig('moderation.bannedWords');

                // Checks if the message contained prohibited words
                if (bannedWords.some(word => message.content.toLowerCase().includes(word))) match = true;
                
                // Stops the switch
                break;

            // Invitations filter
            case 'invites':

                // Filters the text in search of invitation codes
                let detectedInvites = message.content.match(new RegExp(/(https?:\/\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\/invite)\/[^\s\/]+?(?=\b)/gm));

                // If invitations were found, it is proven that they are not from the guild
                if (detectedInvites) {

                    // Stores the legitimate invitation count
                    let legitInvites = 0;

                    // Stores the server invitations
                    await client.baseGuild.invites.fetch().then(guildInvites => {

                        // Creates an array with invitation codes
                        let inviteCodes = Array.from(guildInvites.keys());

                        // For each invitation detected in the message
                        detectedInvites.forEach(filteredInvite => {

                            // For each guild invitation code
                            inviteCodes.forEach(inviteCode => {

                                // Checks if it is an invitation from the base guild
                                if (filteredInvite.includes(inviteCode)) legitInvites++;
                            });
                        });
                    });

                    // Checks to see if found a non-guild invite
                    if (legitInvites < detectedInvites.length) match = true;
                };
                
                // Stops the switch
                break;

            // Excessive capital letters filter
            case 'uppercase':

                // Checks if the message reaches the minimum length to run the filter
                if (message.content.length < filterCfg.minimumLength) break;

                // Checks if exceeds the maximum allowed threshold
                if (message.content.replace(new RegExp(/[^A-Z]/g), '').length > (message.content.length / 100) * filterCfg.percentage) match = true;
                
                // Stops the switch
                break;

            // Links filter
            case 'links':

                // Checks if the message contains a link
                const urlRegex = RegExp('https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}');

                // Returns "true" if it contained a link
                match = urlRegex.test(message.content);
                
                // Stops the switch
                break;

            // Mass emojis filter
            case 'massEmojis':

                // Function to count emojis
                function countEmojis(str) {

                    // Returns the amount of emojis found
                    return Array.from(str.split(/[\ufe00-\ufe0f]/).join('')).length;
                };

                // Stores a copy of the message without UTF emojis
                const stringWithoutUTFEmojis = message.content.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '');

                // Stores the server emojis found
                let serverEmojis = message.content.match(new RegExp(/<:.+?:\d+>/g));

                // If there were server emojis, stores its amount
                if (serverEmojis) serverEmojis = serverEmojis.length;

                // Stores the total amount of emojis in the message
                const emojiCount = (countEmojis(message.content) - countEmojis(stringWithoutUTFEmojis)) + serverEmojis;

                // Checks if exceeded the maximum allowed threshold
                if (emojiCount > filterCfg.quantity) match = true;
                
                // Stops the switch
                break;

            // Mass mentions filter
            case 'massMentions':

                // Counts the mentions of the message
                const mentionCount = (message.content.match(new RegExp(/<@!?(\d+)>/g)) || []).length;

                // Checks if exceeded the maximum allowed threshold
                if (mentionCount > filterCfg.quantity) match = true;
                
                // Stops the switch
                break;

            // Mass spoilers filter
            case 'massSpoilers':

                // Counts the spoilers on the message
                const spoilerCount = (message.content.match(new RegExp(/\|\|.*?\|\|/g)) || []).length;

                // Checks if exceeded the maximum allowed threshold
                if (spoilerCount > filterCfg.quantity) match =  true;
                
                // Stops the switch
                break;

            // Repetitive text filter
            case 'repeatedText':

                // Stores a copy of the message without UTF emojis
                const messageWithoutUTFEmojis = message.content.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '');

                // Stores a copy of the message without any emoji
                const messageWithoutEmojis = messageWithoutUTFEmojis.replace(new RegExp(/<:.+?:\d+>/g), "");

                // Checks if the message contained repetitive text
                let matchedText = new RegExp(`^(.+)(?: +\\1){${filters.repeatedText.maxRepetitions}}`).exec(messageWithoutEmojis);

                // Deletes the blank spaces of the text
                let normalizedText = matchedText != null ? matchedText[1].replace(/\u200E/g, '') : null;

                // Returns a positive result if it was identified
                if (normalizedText != null && normalizedText.length > 0) match = true;

                // Stops the switch
                break;
        };

        // If an infraction was found
        if (match) {

            // Stores the state of non-allowed message
            isPermitted = false;

            // Stores the reason of the infraction
            const reason = message.channel.type === discord.ChannelType.DM ? `${filterCfg.reason} (${locale.filteredDm})` : filterCfg.reason; 
        
            // Executes the infractions handler
            await client.functions.moderation.manageWarn(message.member, reason, filterCfg.action, client.user, message, null, message.channel, message.content.length === 0 ? filteredURL : null);

            // Stops the rest of the loop
            break;
        };
    };

    // Returns the result of the filtering
    return isPermitted;
};
