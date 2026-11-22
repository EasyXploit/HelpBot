// Function to recalculate the reward roles of all the members of the guild that have statistics, that returns the amount of processed members (or null if the bot can not manage roles)
export default async () => {

    // Stores the rewards for level up
    const levelingRewards = await client.functions.db.getConfig('leveling.rewards');

    // Aborts if there are no rewards
    if (levelingRewards.length === 0) return 0;

    // If the bot does not have permission to manage roles
    if (await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ManageRoles'])) {

        // Logs a warning that the bot could not recalculate the reward roles
        logger.warn('The bot could not recalculate the reward roles because it did not have permission to manage roles');

        // Returns that the roles could not be recalculated
        return null;
    };

    // Stores the profiles of all the members with statistics
    const profiles = await client.functions.db.getData('profile');

    // Fetches all the members of the guild
    const members = await client.functions.utils.getAllMembers();

    // Stores the amount of processed members
    let processedMembers = 0;

    // For each of the profiles (one by one, to not exceed the rate limits)
    for (const profile of profiles || []) {

        // Stores the member of the profile, and skips it if it is not in the guild
        const member = members.get(profile.userId);
        if (!member) continue;

        // Assigns the rewards that correspond to its level, and removes the ones above it
        await client.functions.leveling.assignRewards(member, profile.stats.level, true);

        // Counts the processed member
        processedMembers++;
    };

    // Returns the amount of processed members
    return processedMembers;
};
