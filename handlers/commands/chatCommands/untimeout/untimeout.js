export async function run(interaction, commandConfig, locale) {
    
    try {

        // Looks for the member provided
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value);

        // Stores the member ID
        const memberId = member ? member.id : interaction.options._hoistedOptions[0].value;

        // Stores the reason
        let reason = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : null;

        // Capitalizes the reason
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        // If a reason has not been provided
        if (!reason) {

            // Stores if the member can omit the reason
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.reasonNotNeeded});

            // If the member is not authorized, returns an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}.`)
            ], ephemeral: true});
        };

        // Checks if the member was not timeouted
        if (member && (!member.communicationDisabledUntilTimestamp || member.communicationDisabledUntilTimestamp <= Date.now())) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.notSilenced}.`)
        ], ephemeral: true});

        // It is checked if the role of the executing member is lower than that of the target member
        if (member && interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= sortedRoles[0].position) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.badHierarchy, { interactionAuthor: interaction.member })}.`)
        ], ephemeral: true});

        // Stores if the member can erase any timeout
        const canRemoveAny = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.removeAny});

        // Stores the member's timeout
        const memberTimeout = await client.functions.db.getData('timeout', memberId);

        // Returns the authorization status
        if (!canRemoveAny && (!memberTimeout || memberTimeout.moderatorId !== interaction.member.id)) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.cantRemoveAny, { interactionAuthor: interaction.member })}.`)
        ], ephemeral: true});

        // If the timeout was registered in the database
        if (memberTimeout) {

            // Deletes the database entry
            await client.functions.db.delData('timeout', memberId);
        };

        // If there is no records cache
        if (!client.loggingCache) client.loggingCache = {};

        // Creates a new entry in the records cache
        if (member) client.loggingCache[memberId] = {
            action: 'untimeout',
            executor: interaction.member.id,
            reason: reason || locale.undefinedReason
        };

        // Enables the member's communication on the server
        if (member) await member.disableCommunicationUntil(null, reason || locale.undefinedReason);

        // If the member is not in the guild
        if (!member) {

            // Sends a message to the records channel
            await client.functions.managers.sendLog('untimeoutedMember', 'embed', new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                .setAuthor(locale.loggingEmbed.author)
                .addFields(
                    { name: locale.loggingEmbed.memberId, value: member.id.toString(), inline: true },
                    { name: locale.loggingEmbed.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.loggingEmbed.reason, value: reason || locale.undefinedReason, inline: true }
                )
            );
        };

        // Notifies the action in the invocation channel
        await interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
            .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbed.title}`)
            .setDescription(await client.functions.utils.parseLocale(locale.notificationEmbed.description, { member: member ? member.user.tag : `${memberId} (ID)` }))
        ]});
        
    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['UseExternalEmojis', 'ModerateMembers']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('ModerateMembers'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'user',
                type: discord.ApplicationCommandOptionType.User,
                required: true
            },
            {
                optionName: 'reason',
                type: discord.ApplicationCommandOptionType.String,
                required: false
            }
        ]
    }
};
