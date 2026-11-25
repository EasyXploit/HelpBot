// Function to generate the message of a report for the reports channel
export default async (report) => {

    // Stores the translations
    const locale = client.locale.lib.reports.renderReport;

    // Stores the color for each status of the report
    const statusColors = { pending: 'warning', assigned: 'primary', resolved: 'correct', dismissed: 'information' };

    // Generates the base embed of the report
    const reportEmbed = new discord.EmbedBuilder()
        .setColor(`${await client.functions.db.getConfig(`colors.${statusColors[report.status] || 'warning'}`)}`)
        .setTitle(`📢 ${locale.title}`)
        .setFooter({ text: `ID: ${report.reportId}` })
        .setTimestamp(report.createdTimestamp);

    // If a user was reported
    if (report.target && report.target.userId) {

        // Stores the Id of the user
        const userId = report.target.userId;

        // Stores the amount of warnings of the user
        const memberProfile = await client.functions.db.getData('profile', userId);
        const warnsCount = memberProfile ? memberProfile.moderationLog.warnsHistory.length : 0;

        // Adds the details of the user
        reportEmbed.addFields(
            { name: locale.reportedMember, value: `<@${userId}>\n\`${userId}\``, inline: true },
            { name: locale.accountCreated, value: `<t:${Math.round(discord.SnowflakeUtil.timestampFrom(userId) / 1000)}:R>`, inline: true },
            { name: locale.joinedServer, value: report.target.joinedTimestamp ? `<t:${Math.round(report.target.joinedTimestamp / 1000)}:R>` : `\`${locale.unknown}\``, inline: true },
            { name: locale.previousWarnings, value: warnsCount.toString(), inline: true },
            { name: locale.voiceChannel, value: report.target.voiceChannelId ? `<#${report.target.voiceChannelId}>` : `\`${locale.notInVoice}\``, inline: true }
        );
    };

    // If a message was reported
    if (report.message && report.message.id) {

        // Stores the content of the message (shortened if it does not fit, as the full message is attached in that case)
        const content = report.message.content || '';
        const fullMessageNote = `\n*${locale.fullMessageAttached}*`;
        const messageValue = content.length === 0 ? `\`${locale.isInsertion}\`` : content.length > 1024 ? `${client.functions.utils.truncate(content, 1024 - fullMessageNote.length)}${fullMessageNote}` : content;

        // Adds the content and the link of the message
        reportEmbed.addFields(
            { name: locale.reportedMessage, value: messageValue, inline: false },
            { name: locale.messageLink, value: `[${locale.goToMessage}](${report.message.url}) • <#${report.message.channelId}>`, inline: false }
        );

        // Stores the attachments of the message
        const attachments = report.message.attachments || [];

        // Stores the amount of files per field of the embed, and the total number of blocks
        const chunkSize = 5;
        const totalChunks = Math.ceil(attachments.length / chunkSize);

        // For each of the blocks, adds a field with the links to its files
        for (let currentChunk = 1; currentChunk <= totalChunks; currentChunk++) {

            // Generates the links of the files of this block
            const links = [];
            for (let index = chunkSize * (currentChunk - 1); index < Math.min(chunkSize * currentChunk, attachments.length); index++) {
                links.push(`[${await client.functions.utils.parseLocale(locale.fileName, { fileNumber: index + 1, fileType: attachments[index].contentType || '?' })}](${attachments[index].url})`);
            };

            // Adds the field of the block
            reportEmbed.addFields({ name: await client.functions.utils.parseLocale(locale.attachedFiles, { currentChunk: currentChunk, totalChunks: totalChunks }), value: links.join(', '), inline: false });
        };
    };

    // Function to generate the text for the reports that do not fit
    const moreReports = async count => await client.functions.utils.parseLocale(locale.moreReports, { count: count });

    // Generates the list of the reports made by the members (without exceeding the limit of 1024 characters of a field)
    let reportsList = '';
    for (const [index, entry] of report.reports.entries()) {

        // Generates the row of the report, quoting its reason, and the list with it
        const row = `<@${entry.reporterId}> • <t:${Math.round(entry.timestamp / 1000)}:R>${entry.channelId ? ` • <#${entry.channelId}>` : ''}\n> ${client.functions.utils.truncate(entry.reason, 300).replaceAll('\n', '\n> ')}`;
        const newList = `${reportsList}${reportsList.length > 0 ? '\n\n' : ''}${row}`;

        // Stores the space needed for the text of the following reports, if this is not the last one
        const remainingAfter = report.reports.length - index - 1;
        const reservedLength = remainingAfter > 0 ? `\n\n${await moreReports(remainingAfter)}`.length : 0;

        // If the row does not fit, adds the text for the reports that do not fit (this one included) and stops
        if (newList.length + reservedLength > 1024) {
            reportsList += `${reportsList.length > 0 ? '\n\n' : ''}${await moreReports(report.reports.length - index)}`;
            break;
        };

        // Adds the row
        reportsList = newList;
    };

    // Adds the reports and the status of the report
    reportEmbed.addFields(
        { name: await client.functions.utils.parseLocale(locale.reports, { count: report.reports.length }), value: reportsList, inline: false },
        { name: locale.status, value: await client.functions.utils.parseLocale(locale.statuses[report.status], { member: `<@${report.assigneeId || report.closedById}>` }), inline: false }
    );

    // Returns the message of the report
    return { embeds: [reportEmbed] };
};
