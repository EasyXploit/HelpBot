export async function run(interaction, commandConfig, locale) {

    try {

        // Stores the translations of the history
        const historyLocale = client.locale.lib.reports.history;

        // Checks if the member is allowed to handle the reports (the owner of the guild, a bot manager or a reports handler)
        const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: await client.functions.db.getConfig('moderation.reports.handlers') || [] });

        // If not, returns an error
        if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.notAuthorized}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Stores the Id of the member (it may no longer be in the guild)
        const userId = interaction.options.get(locale.appData.options.user.name).value;

        // Responds privately while the history is obtained
        await interaction.deferReply({ flags: discord.MessageFlags.Ephemeral });

        // Obtains the history of reports of the member
        const history = await client.functions.reports.getHistory(userId);

        // Stores the amount of reports per page, and the total of pages
        const reportsPerPage = 5;
        const totalPages = Math.max(1, Math.ceil(history.reports.length / reportsPerPage));

        // Stores the current page and the latest interaction of the navigation
        let actualPage = 1, latestInteraction;

        do {

            // Generates the texts of the reports of the page
            const entries = [];
            for (const report of history.reports.slice((actualPage - 1) * reportsPerPage, actualPage * reportsPerPage)) entries.push(await client.functions.reports.formatHistoryEntry(report, { detailed: true }));

            // Generates the embed of the page
            const pageEmbed = new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                .setTitle(`📜 ${historyLocale.title}`)
                .setDescription(`${await client.functions.utils.parseLocale(historyLocale.allDescription, { member: `<@${userId}>` })}\n\n${entries.length > 0 ? entries.join('\n\n') : `\`${historyLocale.noReports}\``}`)
                .addFields(
                    { name: historyLocale.total, value: history.counts.total.toString(), inline: true },
                    { name: historyLocale.open, value: history.counts.open.toString(), inline: true },
                    { name: historyLocale.resolved, value: history.counts.resolved.toString(), inline: true },
                    { name: historyLocale.dismissed, value: history.counts.dismissed.toString(), inline: true },
                    { name: historyLocale.madeByMember, value: history.madeByUser.toString(), inline: true }
                )
                .setFooter({ text: await client.functions.utils.parseLocale(historyLocale.page, { actualPage: actualPage, totalPages: totalPages }) });

            // Shows the page, with the navigation buttons
            const navigationResult = await client.functions.managers.buttonNavigation(interaction, 'reports', actualPage, totalPages, pageEmbed, latestInteraction, null);

            // Stores the new page and the latest interaction
            latestInteraction = navigationResult.latestInteraction;
            actualPage = navigationResult.newActualPage;

        } while (actualPage !== false);

    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['UseExternalEmojis']
    },
    defaultMemberPermissions: null,
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'user',
                type: discord.ApplicationCommandOptionType.User,
                required: true
            }
        ]
    }
};
