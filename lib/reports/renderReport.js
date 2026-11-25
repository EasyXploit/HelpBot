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

    // Generates the text of the status (with the moment in which it was closed, if so)
    const statusText = await client.functions.utils.parseLocale(locale.statuses[report.status], { member: `<@${report.status === 'assigned' ? report.assigneeId : report.closedById}>` });
    const closedText = report.closedTimestamp && ['resolved', 'dismissed'].includes(report.status) ? ` • <t:${Math.round(report.closedTimestamp / 1000)}:R>` : '';

    // Adds the reports
    reportEmbed.addFields({ name: await client.functions.utils.parseLocale(locale.reports, { count: report.reports.length }), value: reportsList, inline: false });

    // If sanctions were applied from the report
    if (report.actions && report.actions.length > 0) {

        // Stores the emojis of each sanction
        const actionEmojis = { warn: '⚠️', deleteMessage: '🧹', timeout: '🔇', kick: '👢', ban: '🔨' };

        // Generates the list of the sanctions (the latest ones, if they do not fit in the limit of 1024 characters of a field)
        let actionsList = '';
        for (const action of [...report.actions].reverse()) {

            // Generates the row of the sanction, quoting its reason (if any)
            const actionText = await client.functions.utils.parseLocale(locale.actionTexts[action.type], { moderator: `<@${action.moderatorId}>`, duration: action.duration ? client.functions.utils.formatDuration(action.duration) : '' });
            const row = `${actionEmojis[action.type]} ${actionText} • <t:${Math.round(action.timestamp / 1000)}:R>${action.reason ? `\n> ${client.functions.utils.truncate(action.reason, 200).replaceAll('\n', '\n> ')}` : ''}`;

            // If it does not fit, stops
            if (`${row}\n\n${actionsList}`.length > 1024) break;

            // Adds the row before the previous ones, so they are shown in chronological order
            actionsList = actionsList.length > 0 ? `${row}\n\n${actionsList}` : row;
        };

        // Adds the field of the sanctions
        reportEmbed.addFields({ name: locale.actionsTaken, value: actionsList, inline: false });
    };

    // If replies were sent to the reporters
    if (report.replies && report.replies.length > 0) {

        // Generates the list of the replies (the latest ones, if they do not fit in the limit of 1024 characters of a field)
        let repliesList = '';
        for (const reply of [...report.replies].reverse()) {

            // Generates the row of the reply, quoting its text
            const row = `💬 ${await client.functions.utils.parseLocale(locale.replyText, { moderator: `<@${reply.moderatorId}>` })} • <t:${Math.round(reply.timestamp / 1000)}:R>\n> ${client.functions.utils.truncate(reply.text, 200).replaceAll('\n', '\n> ')}`;

            // If it does not fit, stops
            if (`${row}\n\n${repliesList}`.length > 1024) break;

            // Adds the row before the previous ones, so they are shown in chronological order
            repliesList = repliesList.length > 0 ? `${row}\n\n${repliesList}` : row;
        };

        // Adds the field of the replies
        reportEmbed.addFields({ name: locale.repliesSent, value: repliesList, inline: false });
    };

    // Adds the status of the report
    reportEmbed.addFields({ name: locale.status, value: `${statusText}${closedText}`, inline: false });

    // Function to generate a button to handle the report
    const generateButton = (action, emoji, style) => new discord.ButtonBuilder()
        .setCustomId(`report:${report.reportId}:${action}`)
        .setLabel(locale.buttons[action])
        .setEmoji(emoji)
        .setStyle(style);

    // Generates the buttons to handle the report, depending on its status (the closed reports have no buttons)
    const buttons = [];
    if (report.status === 'pending') buttons.push(generateButton('assign', '🙋', discord.ButtonStyle.Primary));
    if (report.status === 'assigned') buttons.push(generateButton('unassign', '↩️', discord.ButtonStyle.Secondary));
    if (['pending', 'assigned'].includes(report.status)) buttons.push(generateButton('resolve', '✅', discord.ButtonStyle.Success), generateButton('dismiss', '🗑️', discord.ButtonStyle.Danger));

    // Generates the rows of components, with the buttons to handle the report
    const components = buttons.length > 0 ? [ new discord.ActionRowBuilder().addComponents(buttons) ] : [];

    // If the report is open, adds the components to apply sanctions
    if (['pending', 'assigned'].includes(report.status)) {

        // Stores the settings of the reports
        const reportsConfig = await client.functions.db.getConfig('moderation.reports');
        const quickActions = reportsConfig.quickActions || [];

        // Stores if there is a reported user, and if there is a reported message that has not been deleted yet
        const hasTarget = !!(report.target && report.target.userId);
        const hasMessage = !!(report.message && report.message.id) && !(report.actions || []).some(action => action.type === 'deleteMessage');

        // Generates the buttons of the enabled sanctions that can be applied
        const sanctionButtons = [];
        if (hasTarget && quickActions.includes('warn')) sanctionButtons.push(generateButton('warn', '⚠️', discord.ButtonStyle.Secondary));
        if (hasMessage && quickActions.includes('deleteMessage')) sanctionButtons.push(generateButton('deleteMessage', '🧹', discord.ButtonStyle.Secondary));
        if (hasTarget && quickActions.includes('kick')) sanctionButtons.push(generateButton('kick', '👢', discord.ButtonStyle.Secondary));
        if (hasTarget && quickActions.includes('ban')) sanctionButtons.push(generateButton('ban', '🔨', discord.ButtonStyle.Secondary));
        if (sanctionButtons.length > 0) components.push(new discord.ActionRowBuilder().addComponents(sanctionButtons));

        // If timeouts can be applied, adds a select menu with the configured durations (up to 25, the limit of Discord)
        const timeoutDurations = (reportsConfig.timeoutDurations || []).slice(0, 25);
        if (hasTarget && quickActions.includes('timeout') && timeoutDurations.length > 0) components.push(new discord.ActionRowBuilder().addComponents(
            new discord.StringSelectMenuBuilder()
                .setCustomId(`report:${report.reportId}:timeout`)
                .setPlaceholder(`🔇 ${locale.timeoutPlaceholder}`)
                .addOptions(timeoutDurations.map(duration => ({ label: client.functions.utils.formatDuration(duration), value: duration.toString() })))
        ));
    };

    // Adds a select menu to reply to the reporters (also in the closed reports), with the templates and the option to write a custom message
    const replyTemplates = ((await client.functions.db.getConfig('moderation.reports')).replyTemplates || []).slice(0, 24);
    components.push(new discord.ActionRowBuilder().addComponents(
        new discord.StringSelectMenuBuilder()
            .setCustomId(`report:${report.reportId}:reply`)
            .setPlaceholder(`💬 ${locale.replyPlaceholder}`)
            .addOptions([
                ...replyTemplates.map((template, index) => ({ label: client.functions.utils.truncate(template, 100), value: `template:${index}` })),
                { label: locale.customReply, value: 'custom', emoji: '✏️' }
            ])
    ));

    // Returns the message of the report
    return { embeds: [reportEmbed], components: components };
};
