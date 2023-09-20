// Function to search for members
export default async (mode, target, channel, fetchCache) => {

    try {

        // Stores the result
        let result;

        // Depending on the selected mode
        switch (mode) {

            // If wanted to look for a member
            case 'member':

                // Checks if the parameter matches with the member mention format
                const memberMatches = target.toString().match(new RegExp(/^<@!?(\d+)>$/));

                // Stores the cache of the guild members
                if (!fetchCache) fetchCache = await client.baseGuild.members.fetch();

                // Looks for Id or mention (depending on the "memberMatches" variable)
                if (memberMatches) result = fetchCache.find(member => member.id === memberMatches[1]);
                else if (!isNaN(target)) result = fetchCache.find(member => member.id === target);
                
                // Stops the switch
                break;
        
            // If wanted to search a user
            case 'user':

                // Checks if the parameter matches with the format of a user mention
                const userMatches = target.toString().match(new RegExp(/^<@!?(\d+)>$/));

                // Looks for Id or mention (depending on the "userMatches" variable)
                if (userMatches) result = fetchCache ? fetchCache : await client.users.fetch(userMatches[1]);
                else if (!isNaN(target)) result = fetchCache ? fetchCache : await client.users.fetch(target);
                
                // Stops the switch
                break;
        
            // If wanted to look for a role
            case 'role':

                // Checks if the parameter matches with the role-mention format
                const roleMatches = target.toString().match(new RegExp(/^<@&?(\d+)>$/));

                // Looks for Id or mention (depending on the "roleMatches" variable)
                if (roleMatches) result = fetchCache ? fetchCache : await client.baseGuild.roles.fetch(roleMatches[1]);
                else if (!isNaN(target)) result = fetchCache ? fetchCache : await client.baseGuild.roles.fetch(target);
                
                // Stops the switch
                break;
        
            // If wanted to find a channel
            case 'channel':

                // Checks if the parameter matches with the channel mention format
                const channelMatches = target.toString().match(new RegExp(/^<#?(\d+)>$/));

                // Looks for Id or mention (depending on the "channelMatches" variable)
                if (channelMatches) result = fetchCache ? fetchCache : await client.baseGuild.channels.fetch(channelMatches[1]);
                else if (!isNaN(target)) result = fetchCache ? fetchCache : await client.baseGuild.channels.fetch(target);
                
                // Stops the switch
                break;
        
            // If wanted to find a message
            case 'message':

                // If a channel was provIded
                if (channel) {

                    // Looks for this channel in the guild
                    const fetchedChannel = fetchCache ? fetchCache : await client.functions.utils.fetch('channel', channel);

                    // If there was a channel, looks for this message on the channel
                    if (fetchedChannel && !isNaN(target)) result = fetchCache ? fetchCache : await fetchedChannel.messages.fetch({ message: target });

                } else {

                    // Stores the guild channels
                    const guildChannels = fetchCache ? fetchCache : await client.baseGuild.channels.fetch();

                    // Iterates among all the guild channels
                    for (const channelId of guildChannels) {

                        // Stores the iterated channel
                        const iteratedChannel = await guildChannels.get(channelId[0]);

                        try {

                            // Looks for the message on the current iteration channel
                            const fetchedMessage = fetchCache ? fetchCache : await iteratedChannel.messages.fetch({ message: target });

                            // If found the message, returns it
                            if (fetchedMessage) return result = fetchedMessage;

                        } catch (error) { 

                            // If the message was not found on this channel, continues with the following
                            if (error.toString().includes('Unknown Message')) continue;
                        };
                    };
                };
                
                // Stops the switch
                break;
        };

        // If there was results (and it was valid), returns it
        if (result && typeof result !== 'undefined') return result;

    } catch (error) {

        // Returns "false"
        return false;
    };
};
