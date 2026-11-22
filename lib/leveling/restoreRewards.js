// Function to restore the reward roles of a member that returns to the guild, according to its saved level
export default async (member) => {

    // Aborts if the engagement module or the experience system are disabled
    if (!await client.functions.db.getConfig('system.modules.engagement') || !await client.functions.db.getConfig('leveling.experienceSystemEnabled')) return;

    // Aborts if the experience and the level of the members that leave are not preserved
    if (!await client.functions.db.getConfig('leveling.preserveExperience')) return;

    // Stores the member's profile, if it exists
    const memberProfile = await client.functions.db.getData('profile', member.id);

    // If the member has statistics, assigns the rewards that correspond to its level
    if (memberProfile) await client.functions.leveling.assignRewards(member, memberProfile.stats.level);
};
