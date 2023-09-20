export async function run(interaction, commandConfig, locale) {
    
    try {

        // Looks for the user provided
        const user = await client.functions.utils.fetch('user', interaction.options._hoistedOptions[0].value);

        // Returns an error if the user has not been found
        if (!user) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.userNotFound}.`)
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

        // Checks if the user was already banned
        const guildBans = await interaction.guild.bans.fetch();

        // Stores the user's ban state
        let banned = false;

        // For each of the bans of the guild
        for (const bans of guildBans) {

            // Checks if the user's Id matches the ban one
            if (bans[0] === user.id) banned = true
        };

        // If the user was not banned, returns an error
        if (!banned) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.notBanned}.`)
        ], ephemeral: true});

        // Unbans the member
        await interaction.guild.members.unban(user.id);
        
        // If the ban was registered in the database
        if (await client.functions.db.getData('ban', user.id)) {

            // Deletes the database entry
            await client.functions.db.delData('ban', user.id);
        };

        // Sends a message to the records channel
        await client.functions.managers.sendLog('unbannedMember', 'embed', new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
            .setAuthor({ name: await client.functions.utils.parseLocale(locale.loggingEmbed.author, { userTag: user.tag }), iconURL: user.displayAvatarURL() })
            .addFields(
                { name: locale.loggingEmbed.userId, value: user.id.toString(), inline: true },
                { name: locale.loggingEmbed.moderator, value: interaction.user.tag, inline: true },
                { name: locale.loggingEmbed.reason, value: reason || locale.undefinedReason, inline: true }
            )
        );

        // Notifies the action in the invocation channel
        await interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
            .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbed.title}`)
            .setDescription(await client.functions.utils.parseLocale(locale.loggingEmbed.author, { userTag: user.tag }))
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
        channel: ['UseExternalEmojis', 'BanMembers']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('Administrator'),
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
