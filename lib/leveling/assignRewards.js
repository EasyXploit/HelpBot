// Function to assign the rewards that correspond to a level to a member (and to remove the ones that do not)
export default async (member, memberLevel, updateSubsequents) => {

    // Function to compare an array
    function compare(a, b) {
        if (a.requiredLevel > b.requiredLevel) return 1;
        if (a.requiredLevel < b.requiredLevel) return -1;
        return 0;
    };

    // Stores the rewards for level up
    const levelingRewards = await client.functions.db.getConfig('leveling.rewards');

    // Compares and orders the rewards array
    const sortedRewards = levelingRewards.sort(compare);

    // Stores if previous rewards need to be removed
    const removePreviousRewards = await client.functions.db.getConfig('leveling.removePreviousRewards');

    // Stores the rewards reached by the member
    const reachedRewards = sortedRewards.filter(reward => reward.requiredLevel <= memberLevel);

    // Stores the last reached level, or 0 if no rewards have been reached
    const lastReachedLevel = reachedRewards.length > 0 ? reachedRewards[reachedRewards.length - 1].requiredLevel : 0;

    // Stores the roles the member must have: the ones of all the reached rewards, or only the ones of the last reached level if previous rewards have to be removed
    const rolesToHave = new Set(reachedRewards.filter(reward => !removePreviousRewards || reward.requiredLevel === lastReachedLevel).flatMap(reward => reward.roles));

    // Stores the roles the member must not have: the ones of the rewards above its level (if subsequent rewards have to be updated), and the ones of the previous rewards (if they have to be removed), except the ones it must have
    const rolesToRemove = new Set(sortedRewards.filter(reward => (updateSubsequents && reward.requiredLevel > memberLevel) || (removePreviousRewards && reward.requiredLevel < lastReachedLevel)).flatMap(reward => reward.roles).filter(role => !rolesToHave.has(role)));

    // Stores the roles to remove that the member has, and the roles to add that the member does not have yet
    const toRemove = [...rolesToRemove].filter(role => member.roles.cache.has(role));
    const toAdd = [...rolesToHave].filter(role => !member.roles.cache.has(role));

    // Aborts if there is nothing to change
    if (toRemove.length === 0 && toAdd.length === 0) return;

    // Checks if the bot has the required permissions
    const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ManageRoles']);

    // If the bot does not have them
    if (missingPermissions) {

        // Logs a warning that the bot could not update the reward roles of the member because it did not have permission to do so
        logger.warn(`The bot could not update the reward roles of ${member.user.tag} (${member.id}) because it did not have permission to do so`);
        
        // Aborts the function
        return;
    };

    // Removes each of the roles the member must not have
    for (const role of toRemove) await member.roles.remove(role).catch(error => logger.warn(`The bot could not remove the reward role ${role} from ${member.user.tag} (${member.id}): ${error.message}`));

    // Stores the rewarded roles
    const rewarded = [];

    // For each of the roles the member must have
    for (const role of toAdd) {

        try {

            // Adds the role to the member
            await member.roles.add(role);

            // Stores the rewarded role
            rewarded.push(role);

        } catch (error) {

            // Records that the role could not be added (for example, because it no longer exists or is above the bot's role)
            logger.warn(`The bot could not add the reward role ${role} to ${member.user.tag} (${member.id}): ${error.message}`);
        };
    };

    // Returns the rewarded roles, if any
    if (rewarded.length > 0) return rewarded;
};
