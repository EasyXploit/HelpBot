// Function to generate the text of a report for the history of reports of a member (with the sanctions applied and who closed it, if specified)
export default async (report, { detailed = false } = {}) => {

    // Stores the translations
    const locale = client.locale.lib.reports.history;

    // Stores the emojis of each status and of each sanction
    const statusEmojis = { pending: '🟡', assigned: '🔵', resolved: '🟢', dismissed: '⚪' };
    const sanctionEmojis = { warn: '⚠️', deleteMessage: '🧹', timeout: '🔇', kick: '👢', ban: '🔨' };

    // Generates the Id of the report, with a link to its message in the reports channel (if it has one)
    const reportIdText = report.card && report.card.messageId ? `[\`${report.reportId}\`](https://discord.com/channels/${client.baseGuild.id}/${report.card.channelId}/${report.card.messageId})` : `\`${report.reportId}\``;

    // Generates the first row with the details of the report, and the second one with its first reason
    let text = `${reportIdText} • ${statusEmojis[report.status]} ${locale.statuses[report.status]} • <t:${Math.round(report.createdTimestamp / 1000)}:R> • 👥 ${report.reports.length}\n> ${client.functions.utils.truncate(report.reports[0].reason, 100).replaceAll('\n', ' ')}`;

    // If the detailed version is wanted
    if (detailed) {

        // Generates the list of the sanctions applied, if any
        const sanctions = [];
        for (const sanction of report.actions || []) sanctions.push(`${sanctionEmojis[sanction.type]} ${await client.functions.utils.parseLocale(client.locale.lib.reports.notifyReporters.sanctionNames[sanction.type], { duration: sanction.duration ? client.functions.utils.formatDuration(sanction.duration) : '' })}`);

        // Adds the sanctions, and who closed the report (if it is closed)
        text += `\n**${locale.sanctions}:** ${sanctions.length > 0 ? sanctions.join(', ') : locale.noSanctions}`;
        if (['resolved', 'dismissed'].includes(report.status) && report.closedById) text += `\n${await client.functions.utils.parseLocale(locale.closedBy, { member: `<@${report.closedById}>` })}`;
    };

    // Returns the text
    return text;
};
