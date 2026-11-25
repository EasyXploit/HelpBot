export async function run(interaction, commandConfig, locale) {
    
    try {

        // Looks for the member provided
        const member = await client.functions.utils.fetch('member', interaction.options.get(locale.appData.options.user.name).value);

        // Returns an error if the member has not been found
        if (!member) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // If the member was a bot
        if (member.user.bot) {

            // Stores if the member can timeout bots
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.botsAllowed});

            // If the member is not authorized to do so, returns an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
            ], flags: discord.MessageFlags.Ephemeral});
        };
        
        // It is checked if the role of the executing member is lower than that of the target member
        if (interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // It is checked if the role of the bot is lower than that of the target member
        if (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badBotHierarchy}`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Stores the expiration provided
        const expiresAfter = interaction.options.get(locale.appData.options.expiration.name).value;

        // If the expiration exceeds the threshold allowed for all
        if (expiresAfter > commandConfig.maxRegularTime) {

            // Stores if the member can timeout for a longer time
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedTime});

            // If the execution was not allowed, sends an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.exceededDuration, { time: await client.functions.utils.msToTime(commandConfig.maxRegularTime) })}.`)
            ], flags: discord.MessageFlags.Ephemeral});
        };

        // Stores the reason
        let reason = interaction.options.get(locale.appData.options.reason.name)?.value ?? null;

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
            ], flags: discord.MessageFlags.Ephemeral});
        };

        // Isolates the member temporarily
        await client.functions.moderation.timeoutMember(member, { moderator: interaction.user, duration: expiresAfter, reason: reason });

        // Generates a description for the notification embed
        const notificationEmbedDescription = reason ? await client.functions.utils.parseLocale(locale.notificationEmbed.withReason, { memberTag: member.user.tag, reason: reason }) : await client.functions.utils.parseLocale(locale.notificationEmbed.withoutReason, { memberTag: member.user.tag })

        // Notifies the action in the invocation channel
        await interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
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
                optionName: 'expiration',
                type: discord.ApplicationCommandOptionType.Number,
                required: true,
                choices: [
                    {
                        choiceName: 'sixtySeconds',
                        value: 60000
                    },
                    {
                        choiceName: 'fiveMinutes',
                        value: 300000
                    },
                    {
                        choiceName: 'fifteenMinutes',
                        value: 900000
                    },
                    {
                        choiceName: 'thirtyMinutes',
                        value: 1800000
                    },
                    {
                        choiceName: 'oneHour',
                        value: 3600000
                    },
                    {
                        choiceName: 'sixHours',
                        value: 21600000
                    },
                    {
                        choiceName: 'twelveHours',
                        value: 43200000
                    },
                    {
                        choiceName: 'oneDay',
                        value: 86400000
                    },
                    {
                        choiceName: 'threeDays',
                        value: 259200000
                    },
                    {
                        choiceName: 'oneWeek',
                        value: 604800000
                    },
                    {
                        choiceName: 'twoWeeks',
                        value: 1209600000
                    },
                    {
                        // 28 days minus a minute, as Discord does not allow timeouts longer than 28 days from the moment it receives them
                        choiceName: 'fourWeeks',
                        value: 2419140000
                    }
                ]
            },
            {
                optionName: 'reason',
                type: discord.ApplicationCommandOptionType.String,
                required: false
            }
        ]
    }
};
