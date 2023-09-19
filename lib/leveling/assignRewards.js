// Function to assign rewards
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

    // Stores the reward roles to assign
    let toReward = [];

    // For each of the rewards available in the configuration
    for (let index = 0; index < sortedRewards.length; index++) {

        // Stores the iterated reward
        const reward = sortedRewards[index];

        // If the reward exceeds the level of the member, stops the loop
        if (!updateSubsequents && reward.requiredLevel > memberLevel) break;

        // Stores if previous rewards need to be eliminated
        const removePreviousRewards = await client.functions.db.getConfig('leveling.removePreviousRewards');

        // For each of the roles of said reward
        reward.roles.forEach(async role => {

            // If old rewards should not be preserved
            if ((removePreviousRewards && !(sortedRewards[index + 1] && reward.requiredLevel < memberLevel && sortedRewards[index + 1].requiredLevel > memberLevel) && index !== (sortedRewards.length - 1)) || reward.requiredLevel > memberLevel) {

                // Checks if the bot has the required permissions, and if so, it eliminates the role to the member if has it
                const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ManageRoles']);
                if (missingPermissions) logger.warn(`The bot could not remove the reward role to ${member.user.tag} (${member.id}) because it did not have permission to do so`);
                else if (member.roles.cache.has(role)) await member.roles.remove(role);
            };
        });

        // Omits this iteration if the level of the reward is higher than the level of the member
        if (reward.requiredLevel > memberLevel) continue;

        // If the member can stack all the rewards, or it has the level of this, it is stored
        if (!removePreviousRewards || reward.requiredLevel === memberLevel || (reward.requiredLevel < memberLevel && index === (sortedRewards.length - 1))) toReward = toReward.concat(reward.roles);

        // If the member has at least the level of the previous reward, it is stored
        if (removePreviousRewards && sortedRewards[index + 1] && reward.requiredLevel < memberLevel && memberLevel < sortedRewards[index + 1].requiredLevel) toReward = toReward.concat(reward.roles);
    };

    // If there were roles to assign
    if (toReward.length > 0) {

        // Stores the rewarded roles
        let rewarded = [];

        // Assigns each of them
        toReward.forEach(async role => {

            // If the member still does not have the role
            if (!member.roles.cache.has(role)) {

                // Checks if the bot has the required permissions, and if so, adds the role to the member
                const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ManageRoles']);
                if (missingPermissions) logger.warn(`The bot could not add the reward role to ${member.user.tag} (${member.id}) because it did not have permission to do so`);
                else {

                    // Adds the role to the member
                    await member.roles.add(role);

                    // Stores the rewarded role
                    rewarded.push(role);
                };
            };
        });

        // Returns the rewarded roles
        if (rewarded.length > 0) return toReward;
    };
};