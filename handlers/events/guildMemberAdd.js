// Exports the event management function
export default async (member, locale) => {
    
    try {

        // Checks if the bot is ready to handle events
        if (!global.readyStatus) return;

        // Aborts if it is not an event from the base guild
        if (member.guild.id !== client.baseGuild.id) return;

        // Stores the join as the last one handled, so it is not recovered when the bot starts again
        if (member.joinedTimestamp > (await client.functions.db.getConfig('welcomes.lastHandledJoin') || 0)) await client.functions.db.setConfig('welcomes.lastHandledJoin', member.joinedTimestamp);

        // Synchronizes the member's timeout
        await client.functions.moderation.syncTimeout(member);

        // If the member has to accept the rules first
        if (member.pending) {

            // Stores the member as pending, so its acceptance can be recovered if it happens while the bot is offline
            const pendingMembers = await client.functions.db.getConfig('welcomes.pendingMembers') || [];
            if (!pendingMembers.includes(member.id)) await client.functions.db.setConfig('welcomes.pendingMembers', [...pendingMembers, member.id]);

        // If the member does not have to accept the rules, restores its reward roles (if it returns to the guild)
        } else if (!member.user.bot) await client.functions.leveling.restoreRewards(member);

        // Stores the new members management mode
        const newMemberMode = await client.functions.db.getConfig('welcomes.newMemberMode');

        // Executes the new members manager, unless the member must be welcomed after accepting the rules
        if (member.user.bot || newMemberMode === 0 || !member.pending) await client.functions.managers.newMember(member);

    } catch (error) {

        // Invokes the error handler
        await client.functions.managers.eventError(error);
    };
};
