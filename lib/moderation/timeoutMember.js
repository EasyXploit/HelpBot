// Function to temporarily isolate a member (the "guildMemberUpdate" event sends the record and notifies the member)
export default async (member, { moderator, duration, reason }) => {

    // Stores the translations of the timeout command, and the final reason
    const locale = client.locale.handlers.commands.chatCommands.timeout;
    const finalReason = reason || locale.undefinedReason;

    // Stores the moment in which the timeout expires
    const untilTimestamp = Date.now() + duration;

    // Keeps the timeout in the database (updating the previous one, if the member had one)
    if (await client.functions.db.getData('timeout', member.id)) await client.functions.db.setData('timeout', member.id, { moderatorId: moderator.id, untilTimestamp: untilTimestamp });
    else await client.functions.db.genData('timeout', { userId: member.id, moderatorId: moderator.id, untilTimestamp: untilTimestamp });

    // Creates an entry in the records cache, so the record shows the moderator and the reason
    if (!client.loggingCache) client.loggingCache = {};
    client.loggingCache[member.id] = { action: 'timeout', executor: moderator.id, reason: finalReason };

    try {

        // Disables the communication of the member on the server
        await member.disableCommunicationUntil(untilTimestamp, finalReason);

    } catch (error) {

        // Deletes the entry of the records cache, as the member was not isolated, and throws the error
        delete client.loggingCache[member.id];
        throw error;
    };
};
