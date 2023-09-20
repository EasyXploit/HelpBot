export async function run(interaction, commandConfig, locale) {

    try {

        // Looks for the member in question
        const member = interaction.options._hoistedOptions[0] ? await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value): await client.functions.utils.fetch('member', interaction.member.id);

        // Stores the member Id
        const memberId = member ? member.id : interaction.options._hoistedOptions[0].value;

        // Checks, if applicable, that the member has permission to see the history of others
        if (interaction.member.id !== memberId) {

            // Variable to know if is authorized
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.canSeeAny});

            // If the execution was not allowed, sends an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.nonPrivileged, { interactionAuthor: interaction.member })}.`)
            ], ephemeral: true});
        };

        // Checks if it is a bot
        if (member && member.user.bot) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});

        // Stores the current page
        let actualPage = 1, totalPages = 1;

        // Stores the total sanctions, in 1 day and 1 week, and the total pages
        let onDay = 0, onWeek = 0, total = 0;

        // Stores the member's profile, or creates it
        let memberProfile = await client.functions.db.getData('profile', memberId);

        // If the member is not on the server and has no profile, returns an error
        if (!memberProfile && !member) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        // Creates the member's profile if is not already created
        if (!memberProfile) memberProfile = await client.functions.db.genData('profile', { userId: memberId });

        // Stores member warnings
        let memberWarns = memberProfile.moderationLog.warnsHistory;

        // Inverts the order of appearance of warnings
        memberWarns = memberWarns.reverse();

        // Stores the total of them
        total = memberWarns.length;

        // Stores the total pages
        totalPages = Math.ceil(memberWarns.length / 10);

        // For each member warning
        for (const warn of memberWarns) {

            // If it occurred in a day or less, counts it
            if ((Date.now() - warn.timestamp) <= 86400000) onDay++;

            // If it occurred in a week or less, counts it
            if ((Date.now() - warn.timestamp) <= 604800000) onWeek++;
        };

        // Stores the last interaction of the command
        let latestInteraction;
        
        do {

            // Stores the first pages range index
            const fromRange = 10 * actualPage - 9;

            // Stores the last index of the page range
            const toRange = 10 * actualPage;

            // Stores the warning list
            let board = '';

            // For each of the rank indexes
            if (memberWarns) for (let index = fromRange - 1; index < toRange; index++) {

                // If there are no more warnings, stops the loop
                if (!memberWarns[index]) break;

                // Stores the warning keys
                const warn = memberWarns[index];

                // Searches and stores the moderator who applied the sanction
                const moderator = warn.executor.type === 'system' ? locale.warnSystemExecutor : await client.functions.utils.fetch('member', warn.executor.memberId) || locale.unknownModerator;

                // Adds a new row with the details of the warning
                board += `\`${warn.warnId}\` • ${moderator} • <t:${Math.round(new Date(parseInt(warn.timestamp)) / 1000)}>\n${warn.reason}\n\n`;
            };

            // Stores the current sanction, if applies
            const sanction = member && member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now() ? `${locale.timeoutedUntil}: <t:${Math.round(new Date(member.communicationDisabledUntilTimestamp) / 1000)}>` : `\`${locale.noTimeout}\``;

            // Generates the infractions embed
            let newPageEmbed = new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                .setTitle(`⚠ ${locale.infractionsEmbed.title}`)
                .setDescription(`${await client.functions.utils.parseLocale(locale.infractionsEmbed.description, { member: member ? member.user.tag : `${memberId} (ID)`, sanction: sanction })}.`)
                .addFields(
                    { name: locale.infractionsEmbed.last24h, value: onDay.toString(), inline: true },
                    { name: locale.infractionsEmbed.last7d, value: onWeek.toString(), inline: true },
                    { name: locale.infractionsEmbed.total, value: total.toString(), inline: true },
                    { name: locale.infractionsEmbed.list, value: total > 0 ? board : locale.infractionsEmbed.noList, inline: false }
                )
                .setFooter({ text: await client.functions.utils.parseLocale(locale.infractionsEmbed.page, { actualPage: actualPage, totalPages: totalPages > 0 ? totalPages : 1 }), iconURL: client.baseGuild.iconURL({dynamic: true}) });

            // If the member was found, shows his avatar in the embed
            if (member) newPageEmbed.setThumbnail(member.user.displayAvatarURL());

            // Invokes the button navigation manager
            const buttonNavigationResult = await client.functions.managers.buttonNavigation(interaction, 'infractions', actualPage, totalPages, newPageEmbed, latestInteraction, null);

            // Stores the last interaction
            latestInteraction = buttonNavigationResult.latestInteraction;

            // Stores the new current page
            actualPage = buttonNavigationResult.newActualPage;

        // As long as it should not be aborted by inactivity, the loop will continue
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
                required: false
            }
        ]
    }
};
