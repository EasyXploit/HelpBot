// Function to handle the buttons of the reports (their custom ID is "report:<report ID>:<action>")
export default async (interaction) => {

    try {

        // Stores the translations
        const locale = client.locale.handlers.buttons.report;

        // Function to respond privately with a message
        const respond = async (color, emoji, text) => await interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig(`colors.${color}`)}`)
            .setDescription(`${emoji} ${text}.`)
        ], flags: discord.MessageFlags.Ephemeral });

        // Stores the Id of the report and the action to perform
        const [, reportId, action] = interaction.customId.split(':');

        // If the moderation module or the reports are disabled, warns about it
        if (!await client.functions.db.getConfig('system.modules.moderation') || !await client.functions.db.getConfig('moderation.reports.enabled')) return await respond('information', client.customEmojis.grayTick, locale.disabled);

        // Stores if the member is the owner of the guild or a bot manager, and if it is allowed to handle the reports
        const isManager = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true });
        const isHandler = isManager || await client.functions.utils.checkAuthorization(interaction.member, { bypassIds: await client.functions.db.getConfig('moderation.reports.handlers') || [] });

        // If the member is not allowed to handle the reports, warns about it
        if (!isHandler) return await respond('error', client.customEmojis.redTick, locale.notAuthorized);

        // Looks for the report
        const report = await client.functions.db.getData('report', reportId);

        // If the report no longer exists, warns about it
        if (!report) return await respond('error', client.customEmojis.redTick, locale.notFound);

        // Stores the statuses in which each action can be performed
        const allowedStatuses = { assign: ['pending'], unassign: ['assigned'], resolve: ['pending', 'assigned'], dismiss: ['pending', 'assigned'] };

        // If the action does not exist, aborts
        if (!allowedStatuses[action]) return;

        // If the report has changed and the action can no longer be performed, warns about it and updates the message of the report
        if (!allowedStatuses[action].includes(report.status)) {
            await interaction.update(await client.functions.reports.renderReport(report));
            return await interaction.followUp({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.information')}`)
                .setDescription(`${client.customEmojis.grayTick} ${locale.outdated}.`)
            ], flags: discord.MessageFlags.Ephemeral });
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
                if (report.assigneeId !== interaction.user.id && !isManager) return await respond('error', client.customEmojis.redTick, locale.notAssignee);

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
