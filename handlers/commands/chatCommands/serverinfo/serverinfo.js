export async function run(interaction, commandConfig, locale) {

    try {

        // Stores the members of the guild
        const guildMembers = interaction.guild.members.cache;

        // Stores the guild channels
        const guildChannels = await interaction.guild.channels.fetch();
        
        // Stores the amount of categories in the guild
        const totalCategories = guildChannels.filter(channel => channel && channel.type === discord.ChannelType.GuildCategory).size;

        // Stores the amount of invitations, if the bot can see them (it needs the "Manage Server" permission)
        const totalInvites = await client.functions.utils.missingPermissions(null, interaction.guild.members.me, ['ManageGuild']) ? '?' : (await interaction.guild.invites.fetch()).size.toString();

        // Stores the amount of banned users, if the bot can see them (it needs the "Ban Members" permission)
        let bannedUsers = '?';
        if (!await client.functions.utils.missingPermissions(null, interaction.guild.members.me, ['BanMembers'])) {

            // Counts the bans in pages of 1000, as it is the maximum that Discord returns at once
            let bansCount = 0, lastBanId;
            while (true) {
                const bans = await interaction.guild.bans.fetch({ limit: 1000, after: lastBanId, cache: false });
                bansCount += bans.size;
                if (bans.size < 1000) break;
                lastBanId = bans.lastKey();
            };
            bannedUsers = bansCount.toString();
        };

        // Generates an embed with the result
        let resultEmbed = new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
            .setAuthor({ name: await client.functions.utils.parseLocale(locale.embed.author, { guildName: interaction.guild.name }), iconURL: interaction.guild.iconURL({dynamic: true}) })
            .setThumbnail(interaction.guild.iconURL({dynamic: true}))
            .addFields({ name: `🏷 ${locale.embed.name}`, value: interaction.guild.name, inline: true })
            .addFields({ name: `🆔 ${locale.embed.id}`, value: interaction.guild.id, inline: true })
            .addFields({ name: `🌍 ${locale.embed.region}`, value: interaction.guild.preferredLocale, inline: true })
            .addFields({ name: `📝 ${locale.embed.creationDate}`, value: `<t:${Math.round(interaction.guild.createdTimestamp / 1000)}>`, inline: true })
            .addFields({ name: `👑 ${locale.embed.owner}`, value: `<@${interaction.guild.ownerId}> (ID: ${interaction.guild.ownerId})`, inline: true })
            .addFields({ name: `🚫 ${locale.embed.explicitContentFilter}`, value: locale.explicitContentFilter[interaction.guild.explicitContentFilter], inline: true })
            .addFields({ name: `💎 ${locale.embed.tier}`, value: `${locale.guildTiers[client.baseGuild.premiumTier]} (${await client.functions.utils.parseLocale(locale.embed.boostsCount, { boostsCount: interaction.guild.premiumSubscriptionCount })})`, inline: true })
            .addFields({ name: `👮 ${locale.embed.verification}`, value: locale.guildVerificationLevel[interaction.guild.verificationLevel], inline: true } )
            .addFields({ name: `🎟️ ${locale.embed.invitations}`, value: await client.functions.utils.parseLocale(locale.embed.totalInvites, { totalInvites: totalInvites }), inline: true })
            .addFields({ name: `🔖 ${locale.embed.roles}`, value: await client.functions.utils.parseLocale(locale.embed.totalRoles, { totalRoles: (await interaction.guild.roles.fetch()).size.toString() }), inline: true })
            .addFields({ name: `🌝 ${locale.embed.stickersAndEmojis}`, value: `${await client.functions.utils.parseLocale(locale.embed.totalEmojis, { totalEmojis: (await interaction.guild.emojis.fetch()).size.toString() })}\n${await client.functions.utils.parseLocale(locale.embed.totalStickers, { totalStickers: (await interaction.guild.stickers.fetch()).size.toString() })}`, inline: true })
            .addFields({ name: `👥 ${locale.embed.members}`, value: `${await client.functions.utils.parseLocale(locale.embed.totalMembers, { totalMembers: guildMembers.size })}\n${await client.functions.utils.parseLocale(locale.embed.totalHumans, { totalHumans: guildMembers.filter(member => !member.user.bot).size })}\n${await client.functions.utils.parseLocale(locale.embed.totalBots, { totalBots: guildMembers.filter(member => member.user.bot).size })}`, inline: true },)
            .addFields({ name: `🔨 ${locale.embed.bans}`, value: await client.functions.utils.parseLocale(locale.embed.bannedUsers, { bannedUsers: bannedUsers }), inline: true })
            .addFields({ name: `🕗 ${locale.embed.afk}`, value: await client.functions.utils.parseLocale(locale.embed.afkTime, { afkTime: interaction.guild.afkTimeout / 60 }), inline: true })
            .addFields({ name: `💬 ${locale.embed.channels}`, value: `${await client.functions.utils.parseLocale(locale.embed.totalCategories, { totalCategories: totalCategories })}\n${await client.functions.utils.parseLocale(locale.embed.totalTextChannels, { totalTextChannels: guildChannels.filter(c => c.type === discord.ChannelType.GuildText).size })}\n${await client.functions.utils.parseLocale(locale.embed.totalVoiceChannels, { totalVoiceChannels: guildChannels.filter(c => c.type === discord.ChannelType.GuildVoice).size })}`, inline: true })

        // Adds a description if the server has it
        if (interaction.guild.description) resultEmbed.setDescription(interaction.guild.description);

        // Sends an embed with the result
        await interaction.reply({ embeds: [ resultEmbed ]});

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
    defaultMemberPermissions: new discord.PermissionsBitField('Administrator'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput
    }
};
