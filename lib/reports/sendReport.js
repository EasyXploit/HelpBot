// Function to manage the reports made by the members
export default async (interaction, modalInteraction, reportReason, reportedMember) => {

    // Stores the interaction to respond to, and a function to respond to it (editing the reply if it was already acknowledged)
    const target = modalInteraction ? modalInteraction : interaction;
    const respond = payload => target.deferred ? target.editReply({ ...payload, flags: undefined }) : target.reply(payload);

    // Stores the translations
    const locale = client.locale.lib.reports.sendReport;

    // Function to respond with a confirmation or an error message
    const respondResult = async delivered => await respond({ embeds: [ new discord.EmbedBuilder()
        .setColor(`${await client.functions.db.getConfig(delivered ? 'colors.secondaryCorrect' : 'colors.error')}`)
        .setDescription(`${delivered ? client.customEmojis.greenTick : client.customEmojis.redTick} ${delivered ? locale.correct : locale.temporaryError}.`)
    ], flags: discord.MessageFlags.Ephemeral});

    try {

        // Stores the settings of the reports
        const reportsConfig = await client.functions.db.getConfig('moderation.reports');

        // Checks if the reports are enabled
        if (!reportsConfig || !reportsConfig.enabled) {

            // Sends a warning message to the user
            return await respond({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.information')}`)
                .setDescription(`${client.customEmojis.grayTick} ${locale.featureDisabled}.`)
            ], flags: discord.MessageFlags.Ephemeral});
        };

        // Stores the reported message, if any
        const reportedMessage = interaction.isMessageContextMenuCommand() ? interaction.targetMessage : null;

        // Generates the entry of this report
        const entry = { reporterId: interaction.user.id, reason: reportReason, channelId: interaction.channelId, timestamp: Date.now() };

        // If a message was reported
        if (reportedMessage) {

            // Looks for an open report of the same message
            const openReports = await client.functions.db.getData('report', null, { 'message.id': reportedMessage.id, status: { $in: ['pending', 'assigned'] } });
            const existingReport = openReports && openReports.length > 0 ? openReports[0] : null;

            // If there is one, adds this report to it
            if (existingReport) {

                // If the member already reported this message, warns about it
                if (existingReport.reports.some(otherEntry => otherEntry.reporterId === entry.reporterId)) return await respond({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.information')}`)
                    .setDescription(`${client.customEmojis.grayTick} ${locale.alreadyReported}.`)
                ], flags: discord.MessageFlags.Ephemeral});

                // Adds the entry to the report and saves it
                existingReport.reports.push(entry);
                await existingReport.save();

                // Updates the message of the report, and responds with the result
                return await respondResult(await client.functions.reports.updateCard(existingReport));
            };
        };

        // Creates the new report in the database
        const report = await client.functions.db.genData('report', {
            reportId: await client.functions.utils.generateSid(),
            status: 'pending',
            target: reportedMember ? {
                userId: reportedMember.id,
                joinedTimestamp: reportedMember.joinedTimestamp || null,
                voiceChannelId: reportedMember.voice && reportedMember.voice.channelId ? reportedMember.voice.channelId : null
            } : {},
            message: reportedMessage ? {
                id: reportedMessage.id,
                channelId: reportedMessage.channelId,
                url: reportedMessage.url,
                content: reportedMessage.content,
                attachments: Array.from(reportedMessage.attachments.values()).map(attachment => ({ name: attachment.name, url: attachment.url, contentType: attachment.contentType }))
            } : {},
            reports: [entry],
            createdTimestamp: Date.now()
        });

        // Sends the report to the reports channel
        const delivered = await client.functions.reports.updateCard(report, { isNew: true });

        // If it could not be delivered, deletes the report from the database
        if (!delivered) await client.functions.db.delData('report', report.reportId);

        // Responds with the result
        await respondResult(delivered);

    } catch (error) {

        // Shows an error through the console
        logger.error(error.stack);

        // Responds with an error message, if possible
        await respondResult(false).catch(() => null);
    };
};
