// Function to apply the automatic moderation to a report, when the configured amount of different members reported the same message or member
export default async (report) => {

    try {

        // Stores the translations
        const locale = client.locale.lib.reports.autoModerate;

        // Aborts if the automatic moderation already acted on this report, or if the report is closed or has no reported user
        if (report.autoModerated || !['pending', 'assigned'].includes(report.status) || !report.target || !report.target.userId) return;

        // Stores the settings of the automatic moderation
        const autoModeration = (await client.functions.db.getConfig('moderation.reports')).autoModeration;

        // Stores if a message was reported, and the settings for this kind of report
        const isMessageReport = !!(report.message && report.message.id);
        const settings = isMessageReport ? autoModeration.messages : autoModeration.members;

        // Aborts if the automatic moderation is disabled for this kind of report
        if (!settings || !settings.enabled) return;

        // Stores the amount of different members who reported it
        let reportersCount;

        // If a message was reported, counts the members who reported it
        if (isMessageReport) reportersCount = new Set(report.reports.map(entry => entry.reporterId)).size;

        // If a member was reported
        else {

            // Stores the reports of the member (not of its messages) made in the time window
            const since = Date.now() - settings.timeWindow;
            const memberReports = await client.functions.db.getData('report', null, { 'target.userId': report.target.userId, 'message.id': null, 'reports.timestamp': { $gt: since } }) || [];

            // If the automatic moderation already acted on any of them in the time window, aborts
            if (memberReports.some(memberReport => memberReport.autoModerated && memberReport.reportId !== report.reportId && (memberReport.actions || []).some(action => action.automatic && action.timestamp > since))) return;

            // Counts the different members who reported it in the time window
            reportersCount = new Set(memberReports.flatMap(memberReport => memberReport.reports.filter(entry => entry.timestamp > since).map(entry => entry.reporterId))).size;
        };

        // Aborts if the threshold has not been reached
        if (reportersCount < settings.threshold) return;

        // Looks for the reported member
        const member = await client.functions.utils.fetch('member', report.target.userId);

        // If it is a member, and it is a bot, the owner of the guild, a bot manager or a reports handler, does not apply the automatic moderation
        if (member && (member.user.bot || await client.functions.utils.checkAuthorization(member, { guildOwner: true, botManagers: true, bypassIds: await client.functions.db.getConfig('moderation.reports.handlers') || [] }))) return;

        // Stores the reason of the sanctions
        const reason = await client.functions.utils.parseLocale(locale.reason, { count: reportersCount });

        // Marks the report, so the automatic moderation does not act again on it
        report.autoModerated = true;

        // If a message was reported and it has to be deleted (and it was not deleted yet)
        if (isMessageReport && settings.deleteMessage && !report.actions.some(action => action.type === 'deleteMessage')) {

            // Looks for the channel and the message
            const messageChannel = await client.functions.utils.fetch('channel', report.message.channelId);
            const reportedMessage = messageChannel ? await client.functions.utils.fetch('message', report.message.id, messageChannel) : null;

            // If the message was found, deletes it (if the bot has permission to do so) and records it
            if (reportedMessage) {
                if (await client.functions.utils.missingPermissions(messageChannel, client.baseGuild.members.me, ['ManageMessages'])) logger.warn(`The automatic moderation could not delete the message of the report ${report.reportId}, as the bot does not have the "Manage Messages" permission`);
                else {
                    await reportedMessage.delete();
                    report.actions.push({ type: 'deleteMessage', moderatorId: client.user.id, reason: reason, timestamp: Date.now(), automatic: true });
                };
            };
        };

        // If the member has to be timed out, and it is still in the guild
        if (settings.timeoutDuration > 0 && member) {

            // If the bot can not time it out (due to the permissions or the hierarchy), warns about it
            if (!member.moderatable) logger.warn(`The automatic moderation could not time out ${member.user.tag} (${member.id}) for the report ${report.reportId}, as the bot does not have permission to do so`);

            // Otherwise, times it out and records it
            else {
                await client.functions.moderation.timeoutMember(member, { moderator: client.user, duration: settings.timeoutDuration, reason: reason });
                report.actions.push({ type: 'timeout', moderatorId: client.user.id, reason: reason, duration: settings.timeoutDuration, timestamp: Date.now(), automatic: true });
            };
        };

        // Saves the report and updates its message
        await report.save();
        await client.functions.reports.updateCard(report);

    } catch (error) {

        // Logs the error
        logger.error(`An error occurred while applying the automatic moderation to the report ${report.reportId}: ${error.stack}`);
    };
};
