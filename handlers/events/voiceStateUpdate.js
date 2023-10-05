// Exports the event management function
export default async (oldState, newState, locale) => {
    
    try {

        // Checks if the bot is ready to handle events
        if (!global.readyStatus) return;

        // Aborts if it is not an event from the base guild
        if (oldState.guild.id !== client.baseGuild.id) return;

        // Stores the excluded channels from the records of voice state changes
        const excludedChannels = await client.functions.db.getConfig('moderation.voiceMovesExcludedChannels');

        // If a change between ignored channels did not occur
        voiceMovesIf: if (!(excludedChannels.includes(oldState.channelId) && excludedChannels.includes(newState.channelId))) {

            // Omits if it is only a change that does not imply channel change
            if (oldState.channelId === newState.channelId) break voiceMovesIf;

            // Omits if the member connects or disconnects from an excluded channel
            if (!oldState.channelId && excludedChannels.includes(newState.channelId)) break voiceMovesIf;
            if (!newState.channelId && excludedChannels.includes(oldState.channelId)) break voiceMovesIf;

            // Stores the fields of previous and new channel, obfuscating the ignored channels
            const oldChannel = oldState.channelId && !excludedChannels.includes(oldState.channelId) ? `<#${oldState.channel.id}>` : `\`${await client.functions.utils.parseLocale(locale.voiceMovesLogging.noChannel)}\``;
            const newChannel = newState.channelId && !excludedChannels.includes(newState.channelId) ? `<#${newState.channel.id}>` : `\`${await client.functions.utils.parseLocale(locale.voiceMovesLogging.noChannel)}\``;

            // Generates the fields of previous and new channel for the embed of records
            let embedFields = [
                { name: await client.functions.utils.parseLocale(locale.voiceMovesLogging.oldChannel), value: oldChannel, inline: true },
                { name: await client.functions.utils.parseLocale(locale.voiceMovesLogging.newChannel), value: newChannel, inline: true }
            ];

            // If there is a new channel for the member and this is not ignored
            if (newState.channelId && !excludedChannels.includes(newState.channelId)) {

                // Generates and stores an array with the tags of the members of that channel
                const channelMembers = Array.from(newState.channel.members, member => newState.channel.members.get(member[0]));

                // Adds a block of code with the tags of the channel members to the records embed
                embedFields.push({ name: `${await client.functions.utils.parseLocale(locale.voiceMovesLogging.actualMembers)} (${newState.channel.members.size}/${newState.channel.userLimit != 0 ? newState.channel.userLimit : '∞'})`, value: `${channelMembers.join(', ')}`});
            };
            
            // Formats and sends a record to the channel specified in the configuration
            if (oldState.member) await client.functions.managers.sendLog('voiceMoves', 'embed', new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                .setAuthor({ name: await client.functions.utils.parseLocale(locale.voiceMovesLogging.embedAuthor, { memberTag: oldState.member.user.tag }), iconURL: oldState.member.user.displayAvatarURL() })
                .setFields(embedFields)
                .setTimestamp()
            );
        };

        // Aborts the rest of the execution if XP rewards are not enabled
        if (!await client.functions.db.getConfig('leveling.rewardVoice')) return;

        // Creates an object in the client for user's voice
        if (!client.usersVoiceStates) client.usersVoiceStates = {};

        // Function for the member to stop gaining XP
        async function endVoiceTime() {

            // Stores the gain interval of XP
            const XPGainInterval = await client.functions.db.getConfig('leveling.XPGainInterval');

            // If the current timestamp is superior to the MS of the gain interval of XP configured
            if (client.usersVoiceStates[newState.id] && Date.now() > (client.usersVoiceStates[newState.id].lastXpReward + XPGainInterval)) {

                // Stores the member
                const member = await client.functions.utils.fetch('member', newState.id);

                // If the member is timeouted or deafen, does nothing
                if (!member || member.voice.mute || member.voice.deaf) return;

                // Stores the channel
                const channel = await client.functions.utils.fetch('channel', oldState.channelId);

                // Adds XP to the member for the last time
                await client.functions.leveling.addExperience(member, 'voice', channel);

                // Stores the member's profile, or creates it
                let memberProfile = await client.functions.db.getData('profile', member.id) || await client.functions.db.genData('profile', { userId: member.id });

                // Updates the voice time of the member
                memberProfile.stats.aproxVoiceTime += XPGainInterval;

                // Saves the new statistics of the member in the database
                await client.functions.db.setData('profile', member.id, memberProfile);
            };
            
            // Deletes the record of the member who has left the voice channel
            delete client.usersVoiceStates[newState.id];
        };

        // If there is a new connection or an old changes
        if (newState.channel && newState.channel !== null && newState.channelId !== null) {

            // Stores the member
            const member = newState.member;

            // The minutes count ends if the member is left alone or with only bots in the room
            if (newState.channel.members.filter(member => !member.user.bot).size === 1 && client.usersVoiceStates[newState.id]) return endVoiceTime();

            // If it is a bot, the AFK channel, a forbidden channel or a prohibited role
            if (member.user.bot || (newState.guild.afkChannelId && newState.channelId === newState.guild.afkChannelId)) {

                // If the member had a stored voice state
                if (client.usersVoiceStates[newState.id]) {

                    // Deletes the record of the member who has left the voice channel
                    delete client.usersVoiceStates[newState.id];
                };

                // Aborts the rest of the program
                return;
            };

            // If has only changed rooms
            if (client.usersVoiceStates[newState.id]) {

                // Changes the current channel Id
                client.usersVoiceStates[newState.id].channelID = newState.channelId

            } else { // If it has been connected from 0

                // Creates a new entry into the list of voice states
                client.usersVoiceStates[newState.id] = {
                    guild: newState.guild.id,
                    channelID: newState.channelId,
                    lastXpReward: Date.now()
                };
            };

        } else if (!newState.channel || newState.channelId == null || newState.channel == null) { // If the connection disappears

            // Finishes the XP gain interval for the member
            endVoiceTime();
        };

    } catch (error) {

        // Executes the error handler
        await client.functions.managers.eventError(error);
    };
};
