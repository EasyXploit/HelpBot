// Function to prepare the recovery of the joins that happened while the bot was offline (it must be called before handling events, so no member is welcomed twice)
// Returns a function that performs the recovery, or nothing if there is nothing to recover
export default async () => {

    // Stores the members of the guild (loaded in the cache when the system is loaded)
    const members = client.baseGuild.members.cache;

    // Stores the join timestamp of the last member handled, and the members that had not accepted the rules
    const lastHandledJoin = await client.functions.db.getConfig('welcomes.lastHandledJoin') || 0;
    const pendingMembers = await client.functions.db.getConfig('welcomes.pendingMembers') || [];

    // Stores the join timestamp of the newest member
    const newestJoin = Math.max(lastHandledJoin, ...members.map(member => member.joinedTimestamp || 0));

    // If the bot has never handled a join, only stores the current state, so it does not welcome all the members
    if (!lastHandledJoin) {

        // Stores the newest join and the members that have not accepted the rules
        await client.functions.db.setConfig('welcomes.lastHandledJoin', newestJoin || Date.now());
        await client.functions.db.setConfig('welcomes.pendingMembers', members.filter(member => member.pending).map(member => member.id));

        // Returns that there is nothing to recover
        return;
    };

    // Stores the members that joined while the bot was offline (sorted by arrival), and the ones that accepted the rules while it was offline
    const newcomers = [...members.filter(member => member.joinedTimestamp > lastHandledJoin).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).values()];
    const acceptedRules = pendingMembers.map(memberId => members.get(memberId)).filter(member => member && !member.pending);

    // Updates the members that have not accepted the rules: removes the ones that left or accepted them, and adds the pending newcomers
    const stillPending = pendingMembers.filter(memberId => members.has(memberId) && members.get(memberId).pending);
    await client.functions.db.setConfig('welcomes.pendingMembers', [...new Set([...stillPending, ...newcomers.filter(member => member.pending).map(member => member.id)])]);

    // Stores the newest handled join
    await client.functions.db.setConfig('welcomes.lastHandledJoin', newestJoin);

    // Aborts if there is nothing to recover
    if (newcomers.length === 0 && acceptedRules.length === 0) return;

    // Stores the new members management mode
    const newMemberMode = await client.functions.db.getConfig('welcomes.newMemberMode');

    // Stores the members to welcome: the newcomers that do not have to accept the rules first, and the ones that accepted them (if they are welcomed then)
    const toWelcome = [...newcomers.filter(member => member.user.bot || newMemberMode === 0 || !member.pending), ...(newMemberMode === 1 ? acceptedRules : [])];

    // Stores the settings of the public welcome
    const publicWelcome = await client.functions.db.getConfig('welcomes.publicWelcome');

    // Stores whether the public welcomes can be recovered: always, or only if they are not more than the limit
    const humanWelcomes = toWelcome.filter(member => !member.user.bot).length;
    const publicRecoveryAllowed = publicWelcome.recovery === 'all' || (publicWelcome.recovery === 'limit' && humanWelcomes <= publicWelcome.recoveryLimit);

    // Returns the function that performs the recovery
    return async () => {

        // Notifies the start of the recovery
        logger.debug(`Recovering ${newcomers.length} joins and ${acceptedRules.length} rules acceptances that happened while the bot was offline`);

        // For each of the newcomers (one by one, to not exceed the rate limits)
        for (const member of newcomers) {

            // Synchronizes its timeout
            await client.functions.moderation.syncTimeout(member);

            // If the member does not have to accept the rules first, restores its reward roles (if it returned to the guild)
            if (!member.pending && !member.user.bot) await client.functions.leveling.restoreRewards(member);

            // Welcomes the member, if applicable
            if (toWelcome.includes(member)) await client.functions.managers.newMember(member, { recovered: true, publicRecoveryAllowed: publicRecoveryAllowed });
        };

        // For each of the members that accepted the rules
        for (const member of acceptedRules) {

            // Restores its reward roles (if it returned to the guild)
            await client.functions.leveling.restoreRewards(member);

            // Welcomes the member, if applicable
            if (toWelcome.includes(member)) await client.functions.managers.newMember(member, { recovered: true, publicRecoveryAllowed: publicRecoveryAllowed });
        };

        // Notifies the end of the recovery
        logger.debug('Joins recovery completed');
    };
};
