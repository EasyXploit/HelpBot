// Function to load the members that are in a voice channel, so they start earning XP for their voice time
export default async () => {

    // Stores the cache of voice states
    const voiceStates = client.baseGuild.voiceStates.cache;

    // Creates an object in the client for user voice states
    if (!client.usersVoiceStates) client.usersVoiceStates = {};

    // For each voice state
    for (const voiceState of voiceStates.values()) {

        // Skips the voice states of members that are no longer in a channel
        if (!voiceState.channelId) continue;

        // Stores the member, if found
        const member = await client.functions.utils.fetch('member', voiceState.id);
        if (!member) continue;

        // Checks whether can win XP or not in the channel
        if (member.user.bot || (voiceState.guild.afkChannelId && voiceState.channelId === voiceState.guild.afkChannelId)) {

            // Deletes the record of the member, if it exists
            if (client.usersVoiceStates[voiceState.id]) delete client.usersVoiceStates[voiceState.id];

            // Skips the member
            continue;
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
    };

    // Notifies the correct load of voice states
    logger.debug('Voice states loading completed');
};
