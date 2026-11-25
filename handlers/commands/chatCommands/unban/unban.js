export async function run(interaction, commandConfig, locale) {
    
    try {

        // Looks for the user provided
        const user = await client.functions.utils.fetch('user', interaction.options.get(locale.appData.options.user.name).value);

        // Returns an error if the user has not been found
        if (!user) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.userNotFound}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // Stores the reason
        let reason = interaction.options.get(locale.appData.options.reason.name)?.value ?? null;

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
            ], flags: discord.MessageFlags.Ephemeral});
        };

        // Checks if the user is banned, looking only for its ban (so it works no matter how many bans the guild has)
        const banned = !!await interaction.guild.bans.fetch({ user: user.id, force: true }).catch(() => null);

        // If the user was not banned, returns an error
        if (!banned) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.notBanned}.`)
        ], flags: discord.MessageFlags.Ephemeral});

        // If there is no records cache
        if (!client.loggingCache) client.loggingCache = {};

        // Creates a new entry in the records cache, so the "guildBanRemove" event sends the record
        client.loggingCache[user.id] = {
            action: 'unban',
            executor: interaction.member.id,
            reason: reason || locale.undefinedReason
        };

        // Unbans the member
        await interaction.guild.members.unban(user.id, reason || locale.undefinedReason);
        
        // If the ban was registered in the database
        if (await client.functions.db.getData('ban', user.id)) {

            // Deletes the database entry
            await client.functions.db.delData('ban', user.id);
        };

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
