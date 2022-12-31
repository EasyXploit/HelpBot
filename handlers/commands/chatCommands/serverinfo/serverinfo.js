exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Almacena a los miembros de la guild
        const guildMembers = await interaction.guild.members.fetch();

        //Almacena los canales de la guild
        const guildChannels = await interaction.guild.channels.fetch();
        
        //Almacena las categorías que hay en la guild
        let categories = new Set();

        //Por cada canal de la guild
        interaction.guild.channels.cache.filter(channel => {

            //Si ya estaba en el set, omite la iteración
            if (categories.has(channel.parent)) return;

            //Añade la categoría al set
            categories.add(channel.parent);
        });

        //Envía un embed con el resultado
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.embed.author, { guildName: interaction.guild.name }), iconURL: interaction.guild.iconURL({dynamic: true}) })
            .setDescription(interaction.guild.description)
            .setThumbnail(interaction.guild.iconURL({dynamic: true}))
            .addFields(
                { name: `🏷 ${locale.embed.name}`, value: interaction.guild.name, inline: true },
                { name: `🆔 ${locale.embed.id}`, value: interaction.guild.id, inline: true },
                { name: `🌍 ${locale.embed.region}`, value: interaction.guild.preferredLocale, inline: true },
                { name: `📝 ${locale.embed.creationDate}`, value: `<t:${Math.round(interaction.guild.createdTimestamp / 1000)}>`, inline: true },
                { name: `👑 ${locale.embed.owner}`, value: `<@${interaction.guild.ownerId}> (ID: ${interaction.guild.ownerId})`, inline: true },
                { name: `🚫 ${locale.embed.nsfwFilter}`, value: locale.guildNsfwLevel[interaction.guild.explicitContentFilter], inline: true },
                { name: `💎 ${locale.embed.tier}`, value: `${locale.guildTiers[client.homeGuild.premiumTier]} (${await client.functions.utilities.parseLocale.run(locale.embed.boostsCount, { boostsCount: interaction.guild.premiumSubscriptionCount })})`, inline: true },
                { name: `👮 ${locale.embed.verification}`, value: locale.guildverificationLevel[interaction.guild.verificationLevel], inline: true },
                { name: `🎟️ ${locale.embed.invitations}`, value: await client.functions.utilities.parseLocale.run(locale.embed.totalInvites, { totalInvites: (await interaction.guild.invites.fetch()).size.toString() }), inline: true },
                { name: `🔖 ${locale.embed.roles}`, value: await client.functions.utilities.parseLocale.run(locale.embed.totalRoles, { totalRoles: (await interaction.guild.roles.fetch()).size.toString() }), inline: true },
                { name: `🌝 ${locale.embed.stickersAndEmojis}`, value: `${await client.functions.utilities.parseLocale.run(locale.embed.totalEmojis, { totalEmojis: (await interaction.guild.emojis.fetch()).size.toString() })}\n${await client.functions.utilities.parseLocale.run(locale.embed.totalStickers, { totalStickers: (await interaction.guild.stickers.fetch()).size.toString() })}`, inline: true },
                { name: `👥 ${locale.embed.members}`, value: `${await client.functions.utilities.parseLocale.run(locale.embed.totalMembers, { totalMembers: guildMembers.size })}\n${await client.functions.utilities.parseLocale.run(locale.embed.totalHumans, { totalHumans: guildMembers.filter(member => !member.user.bot).size })}\n${await client.functions.utilities.parseLocale.run(locale.embed.totalBots, { totalBots: guildMembers.filter(member => member.user.bot).size })}`, inline: true },
                { name: `🔨 ${locale.embed.bans}`, value: await client.functions.utilities.parseLocale.run(locale.embed.bannedUsers, { bannedUsers: (await interaction.guild.bans.fetch()).size.toString() }), inline: true },
                { name: `🕗 ${locale.embed.afk}`, value: await client.functions.utilities.parseLocale.run(locale.embed.afkTime, { afkTime: interaction.guild.afkTimeout / 60 }), inline: true },
                { name: `💬 ${locale.embed.channels}`, value: `${await client.functions.utilities.parseLocale.run(locale.embed.totalCategories, { totalCategories: categories.size - 1 })}\n${await client.functions.utilities.parseLocale.run(locale.embed.totalTextChannels, { totalTextChannels: guildChannels.filter(c => c.type === 'GUILD_TEXT').size })}\n${await client.functions.utilities.parseLocale.run(locale.embed.totalVoiceChannels, { totalVoiceChannels: guildChannels.filter(c => c.type === 'GUILD_VOICE').size })}`, inline: true }
            )
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultPermission: false,
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT'
    }
};
