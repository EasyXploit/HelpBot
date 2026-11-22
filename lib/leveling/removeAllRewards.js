// Function to remove the reward roles from all the members of the guild, that returns the amount of updated members (or null if the bot can not manage roles)
export default async () => {

    // Stores the roles of all the rewards
    const levelingRewards = await client.functions.db.getConfig('leveling.rewards');
    const rewardRoles = new Set(levelingRewards.flatMap(reward => reward.roles));

    // Aborts if there are no reward roles
    if (rewardRoles.size === 0) return 0;

    // If the bot does not have permission to manage roles
    if (await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ManageRoles'])) {

        // Logs a warning that the bot could not remove the reward roles
        logger.warn('The bot could not remove the reward roles because it did not have permission to manage roles');

        // Returns that the roles could not be removed
        return null;
    };

    // Fetches all the members of the guild
    const members = await client.functions.utils.getAllMembers();

    // Stores the amount of updated members
    let updatedMembers = 0;

    // For each of the members (one by one, to not exceed the rate limits)
    for (const member of members.values()) {

        // Stores the reward roles that the member has
        const toRemove = member.roles.cache.filter(role => rewardRoles.has(role.id)).map(role => role.id);

        // Skips the member if it does not have any reward role
        if (toRemove.length === 0) continue;

        try {

            // Removes the reward roles from the member
            await member.roles.remove(toRemove);

            // Counts the updated member
            updatedMembers++;

        } catch (error) {

            // Records that the roles could not be removed (for example, because they are above the bot's role)
            logger.warn(`The bot could not remove the reward roles from ${member.user.tag} (${member.id}): ${error.message}`);
        };
    };

    // Returns the amount of updated members
    return updatedMembers;
};
