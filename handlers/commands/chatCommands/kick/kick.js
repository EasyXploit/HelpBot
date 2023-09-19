export async function run(interaction, commandConfig, locale) {
    
    try {

        // Looks for the member provided
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value);

        // Returns an error if the member has not been found
        if (!member) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        // If the member was a bot
        if (member.user.bot) {

            // Stores if the member can kick bots
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.botsAllowed});

            // If the member is not authorized to do so, returns an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
            ], ephemeral: true});
        };
        
        // It is checked if the role of the executing member is lower than that of the target member
        if ((interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) || !member.bannable) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});

        // It is checked if the role of the bot is lower than that of the target member
        if (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badBotHierarchy}`)
        ], ephemeral: true});

        // Stores the reason
        let reason = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : null;

        // Capitalizes the reason
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        // If a reason has not been provided and the member is not the owner
        if (!reason && interaction.member.id !== interaction.guild.ownerId) {

            // Stores if the member can omit the reason
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.reasonNotNeeded});

            // If the member is not authorized, returns an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}.`)
            ], ephemeral: true});
        };

        // If there is no records cache
        if (!client.loggingCache) client.loggingCache = {};

        // Creates a new entry in the records cache
        client.loggingCache[member.id] = {
            action: 'kick',
            executor: interaction.member.id,
            reason: reason || locale.undefinedReason
        };

        // Generates a description for the notification embed
        const notificationEmbedDescription = reason ? await client.functions.utils.parseLocale(locale.notificationEmbed.withReason, { memberTag: member.user.tag, reason: reason }) : await client.functions.utils.parseLocale(locale.notificationEmbed.withoutReason, { memberTag: member.user.tag })

        // Notifies the action in the invocation channel
        await interaction.reply({embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
        ]});

        try {
        
            // Sends a notification to the member
            await member.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utils.parseLocale(locale.privateEmbed.description, { member: member, guildName: interaction.guild.name }))
                .addFields(
                    { name: locale.privateEmbed.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.privateEmbed.reason, value: reason || locale.undefinedReason, inline: true }
                )
            ]});

        } catch (error) {

            // Handles the errors that occur when a private message cannot be delivered
            if (error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "kick log" message to @${member.user.username} (${member.id}) due to an API restriction`);
            else await client.functions.managers.interactionError(error, interaction);
        };

        // Kicks the member
        await member.kick(reason || locale.undefinedReason);
        
    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: ['KickMembers'],
        channel: ['UseExternalEmojis']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('KickMembers'),
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
