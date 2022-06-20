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
            .setAuthor({ name: client.functions.localeParser(locale.embed.author, { guildName: interaction.guild.name }), iconURL: interaction.guild.iconURL({dynamic: true}) })
            .setDescription(interaction.guild.description)
            .setThumbnail(interaction.guild.iconURL({dynamic: true}))
            .addField(`🏷 ${locale.embed.name}`, interaction.guild.name, true)
            .addField(`🆔 ${locale.embed.id}`, interaction.guild.id, true)
            .addField(`🌍 ${locale.embed.region}`, interaction.guild.preferredLocale, true)
            .addField(`📝 ${locale.embed.creationDate}`, `<t:${Math.round(interaction.guild.createdTimestamp / 1000)}>`, true)
            .addField(`👑 ${locale.embed.owner}`, `<@${interaction.guild.ownerId}> (ID: ${interaction.guild.ownerId})`, true)
            .addField(`🚫 ${locale.embed.nsfwFilter}`, locale.guildNsfwLevel[interaction.guild.explicitContentFilter], true)
            .addField(`💎 ${locale.embed.tier}`, `${locale.guildTiers[client.homeGuild.premiumTier]} (${client.functions.localeParser(locale.embed.boostsCount, { boostsCount: interaction.guild.premiumSubscriptionCount })})`, true)
            .addField(`👮 ${locale.embed.verification}`, locale.guildverificationLevel[interaction.guild.verificationLevel], true)
            .addField(`🎟️ ${locale.embed.invitations}`, client.functions.localeParser(locale.embed.totalInvites, { totalInvites: (await interaction.guild.invites.fetch()).size.toString() }), true)
            .addField(`🔖 ${locale.embed.roles}`, client.functions.localeParser(locale.embed.totalRoles, { totalRoles: (await interaction.guild.roles.fetch()).size.toString() }), true)
            .addField(`🌝 ${locale.embed.stickersAndEmojis}`, `${client.functions.localeParser(locale.embed.totalEmojis, { totalEmojis: (await interaction.guild.emojis.fetch()).size.toString() })}\n${client.functions.localeParser(locale.embed.totalStickers, { totalStickers: (await interaction.guild.stickers.fetch()).size.toString() })}`, true)
            .addField(`👥 ${locale.embed.members}`, `${client.functions.localeParser(locale.embed.totalMembers, { totalMembers: guildMembers.size })}\n${client.functions.localeParser(locale.embed.totalHumans, { totalHumans: guildMembers.filter(member => !member.user.bot).size })}\n${client.functions.localeParser(locale.embed.totalBots, { totalBots: guildMembers.filter(member => member.user.bot).size })}`, true)
            .addField(`🔨 ${locale.embed.bans}`, client.functions.localeParser(locale.embed.bannedUsers, { bannedUsers: (await interaction.guild.bans.fetch()).size.toString() }), true)
            .addField(`🕗 ${locale.embed.afk}`, client.functions.localeParser(locale.embed.afkTime, { afkTime: interaction.guild.afkTimeout / 60 }), true)
            .addField(`💬 ${locale.embed.channels}`, `${client.functions.localeParser(locale.embed.totalCategories, { totalCategories: categories.size - 1 })}\n${client.functions.localeParser(locale.embed.totalTextChannels, { totalTextChannels: guildChannels.filter(c => c.type === 'GUILD_TEXT').size })}\n${client.functions.localeParser(locale.embed.totalVoiceChannels, { totalVoiceChannels: guildChannels.filter(c => c.type === 'GUILD_VOICE').size })}`, true)
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.interactionErrorHandler(error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: false,
    appData: {
        type: 'CHAT_INPUT'
    }
};
