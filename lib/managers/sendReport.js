// Function to manage reporting to the reports channel
export default async (interaction, modalInteraction, reportReason, reportedMember) => {

    // Stores the translations
    const locale = client.locale.lib.managers.sendReport;

    try {

        // Checks if the reports channel is configured and stored in memory
        if (!await client.functions.db.getConfig('system.modules.memberReports')) {

            // Sends a warning message to the user
            return await (modalInteraction ? modalInteraction : interaction).reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.information')}`)
                .setDescription(`${client.customEmojis.grayTick} ${locale.featureDisabled}.`)
            ], ephemeral: true});
        };

        // Stores the reported message
        const reportedMessage = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].message : null;

        // A base embed is generated for the report
        let reportEmbed = new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setAuthor({ name: `${await client.functions.utils.parseLocale(locale.reportEmbed.author, { memberTag: interaction.member.user.tag })}:`, iconURL: interaction.member.user.displayAvatarURL() })
            .setFields([
                { name: locale.reportEmbed.reportReason, value: reportReason, inline: true },
                { name: locale.reportEmbed.reportChannel, value: `<#${interaction.channelId}>`, inline: true }
            ])
            .setTimestamp()

        // If a reported member was provided, adds the field to the embed
        if (reportedMember) reportEmbed.addFields([
            { name: locale.reportEmbed.reportedMember, value: `${reportedMember}`, inline: true }

        ]);

        // If a reported message was provided, adds the field to the embed
        if (reportedMessage) reportEmbed.addFields([
            { name: locale.reportEmbed.reportedMessage, value: reportedMessage.content.length > 0 ? reportedMessage.content : `\`${locale.reportEmbed.isInsertion}\``, inline: true },
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

        // Formats and sends a record to the reports channel specified in the configuration
        const deliveryStatus = await client.functions.managers.sendLog('memberReports', 'embed', reportEmbed);

        // Sends a confirmation message if it could be delivered
        if (deliveryStatus) {

            await (modalInteraction ? modalInteraction : interaction).reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setDescription(`${client.customEmojis.greenTick} ${locale.correct}.`)
            ], ephemeral: true});

        } else {
        
            // Sends an error message to the user
            await (modalInteraction ? modalInteraction : interaction).reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.temporaryError}.`)
            ], ephemeral: true});
        };

    } catch (error) {

        // Shows an error through the console
        logger.error(error.stack);
    };
};
