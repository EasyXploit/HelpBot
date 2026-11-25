// Function to manage reporting to the reports channel
export default async (interaction, modalInteraction, reportReason, reportedMember) => {

    // Stores the interaction to respond to, and a function to respond to it (editing the reply if it was already acknowledged)
    const target = modalInteraction ? modalInteraction : interaction;
    const respond = payload => target.deferred ? target.editReply({ ...payload, flags: undefined }) : target.reply(payload);

    // Stores the translations
    const locale = client.locale.lib.managers.sendReport;

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

        // Stores the reported message
        const reportedMessage = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].message : null;

        // A base embed is generated for the report
        let reportEmbed = new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setAuthor({ name: `${await client.functions.utils.parseLocale(locale.reportEmbed.author, { memberTag: interaction.member.user.tag })}:`, iconURL: interaction.member.user.displayAvatarURL() })
            .setFields([
                { name: locale.reportEmbed.reportReason, value: client.functions.utils.truncate(reportReason, 1024), inline: true },
                { name: locale.reportEmbed.reportChannel, value: `<#${interaction.channelId}>`, inline: true }
            ])
            .setTimestamp()

        // If a reported member was provided, adds the field to the embed
        if (reportedMember) reportEmbed.addFields([
            { name: locale.reportEmbed.reportedMember, value: `${reportedMember}`, inline: true }

        ]);

        // If a reported message was provided, adds the field to the embed
        if (reportedMessage) reportEmbed.addFields([
            { name: locale.reportEmbed.reportedMessage, value: reportedMessage.content.length > 0 ? client.functions.utils.truncate(reportedMessage.content, 1024) : `\`${locale.reportEmbed.isInsertion}\``, inline: true },
            { name: locale.reportEmbed.reportedMessageId, value: `[${reportedMessage.id}](${reportedMessage.url})`, inline: true }
        ]);
        
        // If a reported message was provided and it had attachments
        if (reportedMessage && reportedMessage.attachments.size > 0 ) {

            // Stores the amount of files per field of the embed
            const chunkSize = 5; // Safe values: 1-9

            // Stores the total number of blocks
            const totalChunks = Math.ceil(reportedMessage.attachments.size / chunkSize);

            // Gets an array with the attachments of the reported message
            const attachmentsArray = Array.from(reportedMessage.attachments.values());

            // For each of the blocks of the calculated total
            for (let currentChunk = 1; currentChunk <= totalChunks; currentChunk++) {

                // Generates an array to store the processed attachments
                let attachments = [];

                // For each of the attachments that correspond to this block
                for (let index = chunkSize * (currentChunk - 1); index <= chunkSize * currentChunk - 1; index++) {

                    // If the total attachments are reached, stops the loop
                    if (index >= attachmentsArray.length) break;

                    // Generates a string linked to the download of the file to add it to the field
                    attachments.push(`[${await client.functions.utils.parseLocale(locale.reportEmbed.fileName, { fileNumber: index + 1, fileType: attachmentsArray[index].contentType})}](${attachmentsArray[index].url})`)
                };

                // Attach all the fields generated for the attachments to the embed of the report
                reportEmbed.addFields([
                    { name: await client.functions.utils.parseLocale(locale.reportEmbed.attachedFiles, { currentChunk: currentChunk, totalChunks: totalChunks}), value: attachments.join(', '), inline: false }
                    
                ]);
            };
        };

        // Stores whether the report could be delivered
        let deliveryStatus = false;

        // Looks for the reports channel
        const reportsChannel = reportsConfig.channelId && reportsConfig.channelId.length > 0 ? await client.functions.utils.fetch('channel', reportsConfig.channelId) : null;

        // If the channel is not configured or could not be found, warns about it
        if (!reportsChannel) logger.warn('A report could not be delivered, because the reports channel is not configured or could not be found');

        // Otherwise
        else {

            // Checks if the bot has the necessary permissions in the channel
            const missingPermissions = await client.functions.utils.missingPermissions(reportsChannel, reportsChannel.guild.members.me, ['SendMessages', 'EmbedLinks'], true);

            // If permissions are missing, warns about it
            if (missingPermissions) logger.warn(`A report could not be delivered to the reports channel (#${reportsChannel.name}). The bot must have the following permissions on the channel: ${missingPermissions}`);

            // Otherwise
            else {

                // Stores the roles to mention when a new report is received
                const mentionRoles = reportsConfig.mentionRoles || [];

                // Sends the report to the channel, mentioning the configured roles
                await reportsChannel.send({ content: mentionRoles.length > 0 ? mentionRoles.map(roleId => `<@&${roleId}>`).join(' ') : undefined, embeds: [reportEmbed], allowedMentions: { roles: mentionRoles } });

                // Stores that it has been delivered
                deliveryStatus = true;
            };
        };

        // Sends a confirmation message if it could be delivered
        if (deliveryStatus) {

            await respond({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setDescription(`${client.customEmojis.greenTick} ${locale.correct}.`)
            ], flags: discord.MessageFlags.Ephemeral});

        } else {
        
            // Sends an error message to the user
            await respond({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.temporaryError}.`)
            ], flags: discord.MessageFlags.Ephemeral});
        };

    } catch (error) {

        // Shows an error through the console
        logger.error(error.stack);
    };
};
