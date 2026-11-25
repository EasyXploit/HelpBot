// Function to handle the buttons and select menus of the reports (their custom ID is "report:<report ID>:<action>")
export default async (interaction) => {

    try {

        // Stores the translations
        const locale = client.locale.handlers.buttons.report;

        // Function to generate a private message
        const generateMessage = async (color, emoji, text) => ({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig(`colors.${color}`)}`)
            .setDescription(`${emoji} ${text}.`)
        ], flags: discord.MessageFlags.Ephemeral });

        // Function to respond privately with an error message
        const respondError = async text => await interaction.reply(await generateMessage('error', client.customEmojis.redTick, text));

        // Stores the Id of the report and the action to perform
        const [, reportId, action] = interaction.customId.split(':');

        // If the moderation module or the reports are disabled, warns about it
        if (!await client.functions.db.getConfig('system.modules.moderation') || !await client.functions.db.getConfig('moderation.reports.enabled')) return await interaction.reply(await generateMessage('information', client.customEmojis.grayTick, locale.disabled));

        // Stores if the member is the owner of the guild or a bot manager, and if it is allowed to handle the reports
        const isManager = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true });
        const isHandler = isManager || await client.functions.utils.checkAuthorization(interaction.member, { bypassIds: await client.functions.db.getConfig('moderation.reports.handlers') || [] });

        // If the member is not allowed to handle the reports, warns about it
        if (!isHandler) return await respondError(locale.notAuthorized);

        // Looks for the report
        let report = await client.functions.db.getData('report', reportId);

        // If the report no longer exists, warns about it
        if (!report) return await respondError(locale.notFound);

        // Stores the statuses in which each action can be performed
        const openStatuses = ['pending', 'assigned'];
        const allowedStatuses = { assign: ['pending'], unassign: ['assigned'], resolve: openStatuses, dismiss: openStatuses, warn: openStatuses, deleteMessage: openStatuses, timeout: openStatuses, kick: openStatuses, ban: openStatuses };

        // If the action does not exist, aborts
        if (!allowedStatuses[action]) return;

        // If the report has changed and the action can no longer be performed, warns about it and updates the message of the report
        if (!allowedStatuses[action].includes(report.status)) {
            await interaction.update(await client.functions.reports.renderReport(report));
            return await interaction.followUp(await generateMessage('information', client.customEmojis.grayTick, locale.outdated));
        };

        // If the action is a sanction
        if (['warn', 'deleteMessage', 'timeout', 'kick', 'ban'].includes(action)) {

            // If the sanction is not enabled, warns about it
            if (!(await client.functions.db.getConfig('moderation.reports.quickActions') || []).includes(action)) return await respondError(locale.actionDisabled);

            // Stores the permissions needed for each sanction
            const neededPermissions = { warn: 'ModerateMembers', deleteMessage: 'ManageMessages', timeout: 'ModerateMembers', kick: 'KickMembers', ban: 'BanMembers' };

            // Stores the channel of the reported message, or the one in which the first report was made
            const relatedChannel = await client.functions.utils.fetch('channel', report.message && report.message.channelId ? report.message.channelId : report.reports[0].channelId) || interaction.channel;

            // If the member does not have the permission of the sanction (unless it is the owner of the guild or a bot manager), warns about it
            const missingMemberPermissions = isManager ? false : await client.functions.utils.missingPermissions(action === 'deleteMessage' ? relatedChannel : null, interaction.member, [neededPermissions[action]]);
            if (missingMemberPermissions) return await respondError(await client.functions.utils.parseLocale(locale.missingPermissions, { permissions: missingMemberPermissions.join(', ') }));

            // If the bot does not have the permission of the sanction, warns about it
            const missingBotPermissions = await client.functions.utils.missingPermissions(action === 'deleteMessage' ? relatedChannel : null, client.baseGuild.members.me, [neededPermissions[action]]);
            if (missingBotPermissions) return await respondError(await client.functions.utils.parseLocale(locale.botMissingPermissions, { permissions: missingBotPermissions.join(', ') }));

            // If the message has to be deleted
            if (action === 'deleteMessage') {

                // Looks for the message, and warns if it no longer exists
                const reportedMessage = await client.functions.utils.fetch('message', report.message.id, relatedChannel);
                if (!reportedMessage) return await respondError(locale.messageNotFound);

                // Deletes the message
                await reportedMessage.delete();

                // Records the sanction, saves the report and updates its message
                report.actions.push({ type: action, moderatorId: interaction.user.id, timestamp: Date.now() });
                await report.save();
                return await interaction.update(await client.functions.reports.renderReport(report));
            };

            // Looks for the reported member (and the user, as only it is needed to ban)
            const targetMember = await client.functions.utils.fetch('member', report.target.userId);
            const targetUser = targetMember ? targetMember.user : await client.users.fetch(report.target.userId).catch(() => null);

            // If the member is needed and it is no longer in the guild (or the user no longer exists), warns about it
            if ((action !== 'ban' && !targetMember) || !targetUser) return await respondError(locale.memberNotFound);

            // If it is a bot and it has to be warned, warns that it can not be done
            if (action === 'warn' && targetUser.bot) return await respondError(locale.noBots);

            // If it is a member, checks that both the moderator and the bot are above it in the hierarchy
            const hierarchyError = targetMember ? client.functions.moderation.checkHierarchy(interaction.member, targetMember) : null;
            if (hierarchyError) return await respondError(locale[hierarchyError]);

            // If the member has to be timed out, checks that the selected duration is one of the configured ones
            const duration = action === 'timeout' ? parseInt(interaction.values[0]) : null;
            if (action === 'timeout' && !(await client.functions.db.getConfig('moderation.reports.timeoutDurations') || []).includes(duration)) return await respondError(locale.invalidDuration);

            // Generates a modal to ask for the reason of the sanction, with the reason of the first report as default value
            const reasonModal = new discord.ModalBuilder()
                .setTitle(locale.reasonModal.title)
                .setCustomId(`reportSanction:${interaction.id}`)
                .addComponents(new discord.ActionRowBuilder().addComponents(
                    new discord.TextInputBuilder()
                        .setCustomId('reason')
                        .setLabel(locale.reasonModal.fieldTitle)
                        .setPlaceholder(locale.reasonModal.fieldPlaceholder)
                        .setStyle(discord.TextInputStyle.Paragraph)
                        .setMaxLength(500)
                        .setRequired(true)
                        .setValue(client.functions.utils.truncate(report.reports[0].reason, 500))
                ));

            // Shows the modal
            await interaction.showModal(reasonModal);

            // Waits for the modal to be submitted (5 minutes at most)
            const modalInteraction = await interaction.awaitModalSubmit({ filter: modalSubmit => modalSubmit.customId === `reportSanction:${interaction.id}`, time: 300000 }).catch(error => {
                if (error.code === 'InteractionCollectorError') return null;
                throw error;
            });

            // Aborts if the modal was not submitted
            if (!modalInteraction) return;

            // Responds privately while the sanction is applied
            await modalInteraction.deferReply({ flags: discord.MessageFlags.Ephemeral });

            // Stores the reason, capitalizing it
            const providedReason = modalInteraction.fields.getTextInputValue('reason').trim();
            const reason = `${providedReason.charAt(0).toUpperCase()}${providedReason.slice(1)}`;

            // Looks for the report again, in case it was closed while the reason was being written
            report = await client.functions.db.getData('report', reportId);
            if (!report || !openStatuses.includes(report.status)) return await modalInteraction.editReply({ ...await generateMessage('information', client.customEmojis.grayTick, locale.outdated), flags: undefined });

            try {

                // Applies the sanction
                switch (action) {

                    // Warns the member (which also responds with a confirmation)
                    case 'warn':
                        await client.functions.moderation.manageWarn(targetMember, reason, 2, interaction.user, null, modalInteraction, relatedChannel);
                        break;

                    // Times out the member
                    case 'timeout':
                        await client.functions.moderation.timeoutMember(targetMember, { moderator: interaction.user, duration: duration, reason: reason });
                        break;

                    // Kicks the member
                    case 'kick':
                        await client.functions.moderation.kickMember(targetMember, { moderator: interaction.user, reason: reason });
                        break;

                    // Bans the user
                    case 'ban':
                        await client.functions.moderation.banUser(targetUser, { moderator: interaction.user, reason: reason });
                        break;
                };

            } catch (error) {

                // Logs the error, responds with an error message and aborts
                logger.error(error.stack);
                return await modalInteraction.editReply({ ...await generateMessage('error', client.customEmojis.redTick, locale.sanctionFailed), flags: undefined });
            };

            // Records the sanction, saves the report and updates its message
            report.actions.push({ type: action, moderatorId: interaction.user.id, reason: reason, duration: duration, timestamp: Date.now() });
            await report.save();
            await client.functions.reports.updateCard(report);

            // Responds with a confirmation (the warns respond by themselves)
            if (action !== 'warn') await modalInteraction.editReply({ ...await generateMessage('secondaryCorrect', client.customEmojis.greenTick, locale.sanctionApplied[action]), flags: undefined });
            return;
        };

        // Depending on the action
        switch (action) {

            // If the member wants to handle the report, assigns it to the member
            case 'assign':
                report.status = 'assigned';
                report.assigneeId = interaction.user.id;
                break;

            // If the member wants to stop handling the report
            case 'unassign':

                // Only the member to whom it is assigned (or the owner of the guild and the bot managers) can unassign it
                if (report.assigneeId !== interaction.user.id && !isManager) return await respondError(locale.notAssignee);

                // Unassigns the report
                report.status = 'pending';
                report.assigneeId = null;
                break;

            // If the member wants to resolve or dismiss the report, closes it
            case 'resolve':
            case 'dismiss':
                report.status = action === 'resolve' ? 'resolved' : 'dismissed';
                report.closedById = interaction.user.id;
                report.closedTimestamp = Date.now();
                break;
        };

        // Saves the report
        await report.save();

        // Updates the message of the report
        await interaction.update(await client.functions.reports.renderReport(report));

    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};
