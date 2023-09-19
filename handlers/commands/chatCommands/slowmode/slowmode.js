export async function run(interaction, commandConfig, locale) {
    
    try {

        // Stores the interaction's text channel
        const interactionChannel = await client.functions.utils.fetch('channel', interaction.channelId);

        // Stores the seconds provided
        const argument = interaction.options._hoistedOptions[0].value;

        // If slow mode must be deactivated
        if (argument === 0) {

            // If the slow mode was not activated, sends an error
            if (!interactionChannel.rateLimitPerUser) return await interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.notEnabled}`)
            ], ephemeral: true});

            // Disables the slow mode
            await interactionChannel.setRateLimitPerUser(0);

            // Sends a message to the records channel
            await client.functions.managers.sendLog('slowmodeChanged', 'embed', new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                .setTitle(`📑 ${locale.disabledLoggingEmbed.title}`)
                .setDescription(locale.disabledLoggingEmbed.description)
                .addFields(
                    { name: locale.disabledLoggingEmbed.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.disabledLoggingEmbed.channel, value: `${interactionChannel}`, inline: true }
                )
            );

            // Notifies the action in the invocation channel
            await interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setTitle(`${client.customEmojis.greenTick} ${locale.disabledNotificationEmbed.title}`)
                .setDescription(locale.disabledNotificationEmbed.description)
            ], ephemeral: true});

        } else { // If slow mode must be activated

            // Stores if the member can use unlimited time
            const canUseUnlimitedTime = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedTime});

            // Checks if the seconds exceeded the maximum configured
            if (!canUseUnlimitedTime && argument > commandConfig.maxRegularSeconds) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.privateEmbedSingle.description, { max: commandConfig.maxRegularSeconds })}`)
            ], ephemeral: true});

            // Stores the reason
            let reason = interaction.options._hoistedOptions[2] ? interaction.options._hoistedOptions[2].value : null;

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

            // Activates the slow mode on the channel
            await interactionChannel.setRateLimitPerUser(argument, reason || locale.undefinedReason);

            // Sends a message to the records channel
            await client.functions.managers.sendLog('slowmodeChanged', 'embed', new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                .setTitle(`📑 ${locale.enabledLoggingEmbed.title}`)
                .setDescription(locale.enabledLoggingEmbed.description)
                .addFields(
                    { name: locale.enabledLoggingEmbed.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.enabledLoggingEmbed.delay, value: await client.functions.utils.parseLocale(locale.enabledLoggingEmbed.delayed, { seconds: argument }), inline: true },
                    { name: locale.enabledLoggingEmbed.channel, value: `${interactionChannel}`, inline: true },
                    { name: locale.enabledLoggingEmbed.reason, value: reason || locale.undefinedReason, inline: true }
                )
            );

            // Notifies the action in the invocation channel
            await interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setTitle(`${client.customEmojis.greenTick} ${locale.enabledNotificationEmbed.title}`)
                .setDescription(await client.functions.utils.parseLocale(locale.enabledNotificationEmbed.description, { seconds: argument }))
            ], ephemeral: true});
        };
        
    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['UseExternalEmojis', 'ManageChannels']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('ModerateMembers'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'seconds',
                type: discord.ApplicationCommandOptionType.Integer,
                minValue: 0,
                maxValue: 21600,
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
