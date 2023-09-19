export async function run(interaction, commandConfig, locale) {
    
    try {
        
        // Looks for the user provided
        const user = await client.functions.utils.fetch('user', interaction.options._hoistedOptions[0].value);

        // Returns an error if the user has not been found
        if (!user) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.userNotFound}`)
        ], ephemeral: true});

        // If the user was a bot
        if (user.bot) {

            // Stores if the member can ban bots
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.botsAllowed});

            // If is not authorized to do so, returns an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}`)
            ], ephemeral: true});
        };

        // Looks for the member provided
        const member = await client.functions.utils.fetch('member', user.id);

        // It is checked if the role of the executing member is lower than that of the target member
        if (member && ((interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) || !member.bannable)) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}`)
        ], ephemeral: true});

        // It is checked if the role of the bot is lower than that of the target member
        if (member && (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position)) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badBotHierarchy}`)
        ], ephemeral: true});
        
        // Checks if the user was already banned
        const guildBans = await interaction.guild.bans.fetch();

        // Checks if the user was already banned
        for (const bans of guildBans) {

            // If the user was already banned, returns an error
            if (bans[0] === user.id) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyBanned}`)
            ], ephemeral: true});
        };

        // Stores the duration provided
        const durationOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.expiration.name);
        const providedDuration = durationOption ? durationOption.value : null;

        // If a duration has not been provided
        if (!providedDuration) {

            // Stores if the member can ban indefinitely
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedTime});

            // If the execution was not allowed, sends an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantPermaBan}.`)
            ], ephemeral: true});
        };

        // If a duration for the ban has been provided
        if (providedDuration) {

            // Stores if the member can ban
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedTime});

            // If the execution was not allowed, sends an error message
            if (!authorized && providedDuration > commandConfig.maxRegularTime) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.exceededDuration, { time: await client.functions.utils.msToTime(commandConfig.maxRegularTime) })}.`)
            ], ephemeral: true});
        };

        // Stores the days of erased messages
        const deletedDaysOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.days.name);
        const deletedDays = deletedDaysOption ? deletedDaysOption.value : null;

        // If a duration has not been provided
        if (deletedDays) {

            // Stores if the member can ban indefinitely
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.canSoftBan});

            // If the execution was not allowed, sends an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantSoftBan}.`)
            ], ephemeral: true});
        };
        
        // Stores the reason
        const reasonOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.reason.name);
        let reason = reasonOption ? reasonOption.value : null;

        // Capitalizes the reason
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        // If a reason has not been provided and the member is not the owner
        if (!reason && interaction.member.id !== interaction.guild.ownerId) {

            // Stores if the member can omit the reason
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.reasonNotNeeded});

            // If the member is not authorized, returns an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}`)
            ], ephemeral: true});
        };

        // Stores the expiration of the ban
        const expiration = providedDuration ? Date.now() + providedDuration : null;

        // If there is no records cache
        if (!client.loggingCache) client.loggingCache = {};

        // Creates a new entry in the records cache
        client.loggingCache[user.id] = {
            action: 'ban',
            executor: interaction.member.id,
            reason: reason || locale.undefinedReason,
            deletedDays: deletedDays ? deletedDays.toString() : null,
            expiration: expiration
        };

        // If a duration was provided
        if (providedDuration) {

            // Records the ban in the database
            await client.functions.db.genData('ban', {
                userId: user.id,
                moderatorId: interaction.member.id,
                untilTimestamp: Date.now() + providedDuration
            });
        };

        // Stores the parameters for the ban
        const banParameters = { reason: reason || locale.undefinedReason };

        // If deletion of messages (in days) has been provided, stores the parameter turned to seconds
        if (deletedDays) banParameters.deleteMessageSeconds = deletedDays * 24 * 60 * 60;

        // Generates a description for the notification embed
        const notificationEmbedDescription = reason ? await client.functions.utils.parseLocale(locale.notificationEmbed.withReason, { userTag: user.tag, reason: reason }) : await client.functions.utils.parseLocale(locale.notificationEmbed.withoutReason, { userTag: user.tag })

        // Sends a confirmation in response to the interaction
        await interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
        ]});

        try {
        
            // Sends a notification to the member
            if (member) await user.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utils.parseLocale(locale.privateEmbed.description, { user: user, guildName: interaction.guild.name }))
                .addFields(
                    { name: locale.privateEmbed.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.privateEmbed.reason, value: reason || locale.undefinedReason, inline: true },
                    { name: locale.privateEmbed.expiration, value: expiration ? `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>` : locale.privateEmbed.noExpiration, inline: true },
                    { name: locale.privateEmbed.deletedDays, value: deletedDays ? deletedDays.toString() : `\`${locale.privateEmbed.noDeletedDays}\``, inline: true }
                )
            ]});

        } catch (error) {

            // Handles the errors that occur when a private message cannot be delivered
            if (error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver the "ban log" message to @${user.username} (${user.id}) due to an API restriction`);
            else await client.functions.managers.interactionError(error, interaction);
        };

        // Bans the user
        await interaction.guild.members.ban(user, banParameters);
        
    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: ['BanMembers'],
        channel: ['UseExternalEmojis']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('BanMembers'),
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
            },
            {
                optionName: 'days',
                type: discord.ApplicationCommandOptionType.Integer,
                minValue: 1,
                maxValue: 7,
                required: false
            },
            {
                optionName: 'expiration',
                type: discord.ApplicationCommandOptionType.Number,
                required: false,
                choices: [
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
                        value: 604800016
                    },
                    {
                        choiceName: 'oneMonth',
                        value: 2629800000
                    },
                    {
                        choiceName: 'threeMonths',
                        value: 7889400000
                    },
                    {
                        choiceName: 'sixMonths',
                        value: 15778800000
                    },
                    {
                        choiceName: 'nineMonths',
                        value: 23668200000
                    },
                    {
                        choiceName: 'oneYear',
                        value: 31557600000
                    }
                ]
            }
        ]
    }
};