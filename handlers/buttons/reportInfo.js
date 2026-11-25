// Function to handle the button of the private messages that request more information about a report (its custom ID is "reportInfo:<report ID>:<request ID>")
export default async (interaction) => {

    try {

        // Stores the translations
        const locale = client.locale.handlers.buttons.reportInfo;

        // Function to generate a private message
        const generateMessage = async (color, emoji, text) => ({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig(`colors.${color}`)}`)
            .setDescription(`${emoji} ${text}.`)
        ], flags: discord.MessageFlags.Ephemeral });

        // Stores the Id of the report and of the request
        const [, reportId, requestId] = interaction.customId.split(':');

        // Function to check if the member can answer the request, which returns the reason if not
        const checkRequest = async report => {

            // If the moderation module or the reports are disabled, or the report no longer exists or was closed, no more information is needed
            if (!await client.functions.db.getConfig('system.modules.moderation') || !await client.functions.db.getConfig('moderation.reports.enabled') || !report || !['pending', 'assigned'].includes(report.status)) return locale.notNeeded;

            // Stores the request
            const infoRequest = report.infoRequests.find(otherRequest => otherRequest.requestId === requestId);

            // If the request does not exist, or the member did not make the report, it can not answer it
            if (!infoRequest || !report.reports.some(entry => entry.reporterId === interaction.user.id)) return locale.notNeeded;

            // If the member already answered it, it can not do it again
            if (infoRequest.answers.some(answer => answer.reporterId === interaction.user.id)) return locale.alreadyAnswered;

            // Returns nothing, as it can answer it
            return null;
        };

        // If the member can not answer the request, warns about it
        const requestError = await checkRequest(await client.functions.db.getData('report', reportId));
        if (requestError) return await interaction.reply(await generateMessage('information', client.customEmojis.grayTick, requestError));

        // Shows a modal to write the answer
        await interaction.showModal(new discord.ModalBuilder()
            .setTitle(locale.answerModal.title)
            .setCustomId(`reportInfoAnswer:${interaction.id}`)
            .addComponents(new discord.ActionRowBuilder().addComponents(
                new discord.TextInputBuilder()
                    .setCustomId('answer')
                    .setLabel(locale.answerModal.fieldTitle)
                    .setPlaceholder(locale.answerModal.fieldPlaceholder)
                    .setStyle(discord.TextInputStyle.Paragraph)
                    .setMaxLength(1000)
                    .setRequired(true)
            )));

        // Waits for the modal to be submitted (10 minutes at most), and aborts if it was not
        const modalInteraction = await interaction.awaitModalSubmit({ filter: modalSubmit => modalSubmit.customId === `reportInfoAnswer:${interaction.id}`, time: 600000 }).catch(error => {
            if (error.code === 'InteractionCollectorError') return null;
            throw error;
        });
        if (!modalInteraction) return;

        // Responds privately while the answer is sent
        await modalInteraction.deferReply({ flags: discord.MessageFlags.Ephemeral });

        // Looks for the report again, and checks again if the member can answer the request (in case something changed while it was written)
        const report = await client.functions.db.getData('report', reportId);
        const answerError = await checkRequest(report);
        if (answerError) return await modalInteraction.editReply({ ...await generateMessage('information', client.customEmojis.grayTick, answerError), flags: undefined });

        // Stores the answer, records it in the request and saves the report
        const answerText = modalInteraction.fields.getTextInputValue('answer').trim();
        const infoRequest = report.infoRequests.find(otherRequest => otherRequest.requestId === requestId);
        infoRequest.answers.push({ reporterId: interaction.user.id, text: answerText, timestamp: Date.now() });
        await report.save();

        // Updates the message of the report
        await client.functions.reports.updateCard(report);

        // Looks for the message of the report, and replies to it mentioning the moderator who asked, so it gets notified
        const cardChannel = report.card && report.card.channelId ? await client.functions.utils.fetch('channel', report.card.channelId) : null;
        const cardMessage = cardChannel ? await client.functions.utils.fetch('message', report.card.messageId, cardChannel) : null;
        if (cardMessage) await cardMessage.reply({
            content: `<@${infoRequest.moderatorId}>`,
            embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.information')}`)
                .setTitle(`📨 ${await client.functions.utils.parseLocale(locale.newInfoTitle, { reportId: report.reportId })}`)
                .setDescription(`> ${client.functions.utils.truncate(infoRequest.question, 500).replaceAll('\n', '\n> ')}\n\n${answerText}`)
                .setFooter({ text: await client.functions.utils.parseLocale(locale.answeredBy, { userTag: interaction.user.tag }), iconURL: interaction.user.displayAvatarURL() })
            ],
            allowedMentions: { users: [infoRequest.moderatorId] }
        }).catch(error => logger.warn(`The bot could not notify the answer of the report ${report.reportId}: ${error.message}`));

        // Responds with a confirmation
        await modalInteraction.editReply({ ...await generateMessage('secondaryCorrect', client.customEmojis.greenTick, locale.answerSent), flags: undefined });

    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};
