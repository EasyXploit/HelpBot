// Function to check if a member can make a report, which returns a message explaining why if not (or nothing if it can)
export default async (reporterMember, { targetUserId, messageId } = {}) => {

    // Stores the translations
    const locale = client.locale.lib.reports.checkReport;

    // Function to generate the message to respond with
    const generateReply = async (color, emoji, text) => ({ embeds: [ new discord.EmbedBuilder()
        .setColor(`${await client.functions.db.getConfig(`colors.${color}`)}`)
        .setDescription(`${emoji} ${text}.`)
    ], flags: discord.MessageFlags.Ephemeral });

    // Stores the settings of the reports
    const reportsConfig = await client.functions.db.getConfig('moderation.reports');

    // If the reports are not enabled, returns a warning
    if (!reportsConfig || !reportsConfig.enabled) return await generateReply('information', client.customEmojis.grayTick, locale.featureDisabled);

    // If a message is going to be reported, and the member already reported it in an open report, returns a warning
    if (messageId) {
        const openReports = await client.functions.db.getData('report', null, { 'message.id': messageId, status: { $in: ['pending', 'assigned'] } }) || [];
        if (openReports.some(report => report.reports.some(entry => entry.reporterId === reporterMember.id))) return await generateReply('information', client.customEmojis.grayTick, locale.alreadyReported);
    };

    // The owner of the guild and the bot managers have no limits
    if (await client.functions.utils.checkAuthorization(reporterMember, { guildOwner: true, botManagers: true })) return null;

    // Stores the limits of the reports
    const limits = reportsConfig.limits || {};

    // If there is a limit of reports in a period of time
    if (limits.maxReports > 0 && limits.timeWindow > 0) {

        // Stores the reports made by the member in that period of time (of all the reports, as several of them can be in the same one)
        const since = Date.now() - limits.timeWindow;
        const recentReports = await client.functions.db.getData('report', null, { reports: { $elemMatch: { reporterId: reporterMember.id, timestamp: { $gt: since } } } }) || [];
        const timestamps = recentReports.flatMap(report => report.reports.filter(entry => entry.reporterId === reporterMember.id && entry.timestamp > since).map(entry => entry.timestamp)).sort((a, b) => a - b);

        // If the limit has been reached, returns a warning with the moment in which the member will be able to report again
        if (timestamps.length >= limits.maxReports) {
            const availableAt = timestamps[timestamps.length - limits.maxReports] + limits.timeWindow;
            return await generateReply('warning', client.customEmojis.orangeTick, await client.functions.utils.parseLocale(locale.limitReached, { time: `<t:${Math.ceil(availableAt / 1000)}:R>` }));
        };
    };

    // If a member (and not a message) is going to be reported, and there is a cooldown to report the same member again
    if (targetUserId && !messageId && limits.sameMemberCooldown > 0) {

        // Stores the reports of that member (not of its messages) made by the member during the cooldown
        const since = Date.now() - limits.sameMemberCooldown;
        const previousReports = await client.functions.db.getData('report', null, { 'target.userId': targetUserId, 'message.id': null, reports: { $elemMatch: { reporterId: reporterMember.id, timestamp: { $gt: since } } } }) || [];
        const timestamps = previousReports.flatMap(report => report.reports.filter(entry => entry.reporterId === reporterMember.id && entry.timestamp > since).map(entry => entry.timestamp));

        // If there is any, returns a warning with the moment in which the member will be able to report it again
        if (timestamps.length > 0) {
            const availableAt = Math.max(...timestamps) + limits.sameMemberCooldown;
            return await generateReply('warning', client.customEmojis.orangeTick, await client.functions.utils.parseLocale(locale.sameMemberCooldown, { time: `<t:${Math.ceil(availableAt / 1000)}:R>` }));
        };
    };

    // Returns nothing, as the member can make the report
    return null;
};
