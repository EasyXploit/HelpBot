// Function to reset the statistics of a member (all of them, or only the provided ones), keeping the rest of its profile, like the warnings history
// The profile is only deleted if all its statistics are reset and it has no warnings, as nothing else would be lost
export default async (userId, statistics = ['experience', 'level', 'aproxVoiceTime', 'messagesCount']) => {

    // Stores the member's profile, and aborts if it does not exist
    const memberProfile = await client.functions.db.getData('profile', userId);
    if (!memberProfile) return;

    // Stores whether the member has warnings, and whether all its statistics will be reset
    const hasWarnings = memberProfile.moderationLog && memberProfile.moderationLog.warnsHistory && memberProfile.moderationLog.warnsHistory.length > 0;
    const remainingStatistics = ['experience', 'level', 'aproxVoiceTime', 'messagesCount'].filter(statistic => !statistics.includes(statistic) && memberProfile.stats[statistic] > 0);

    // If nothing else would remain in the profile, deletes it
    if (!hasWarnings && remainingStatistics.length === 0) return await client.functions.db.delData('profile', userId);

    // Resets the provided statistics
    await client.functions.db.setData('profile', userId, { $set: Object.fromEntries(statistics.map(statistic => [`stats.${statistic}`, 0])) });
};
