exports.run = async (client, message, args, command, commandConfig, locale) => {

    try {

        //Almacena a los miembros de la guild
        const guildMembers = await message.guild.members.fetch();

        //Almacena los canales de la guild
        const guildChannels = await message.guild.channels.fetch();

        //Almacena las características traducidas
        let translatedFeatures = [];

        //Traduce las características de la guild
        await message.guild.features.forEach(async (feature) => translatedFeatures.push(client.locale.guildFeatures[feature] || permission));
        
        //Almacena las categorías que hay en la guild
        let categories = new Set();

        //Por cada canal de la guild
        message.guild.channels.cache.filter(channel => {

            //Si ya estaba en el set, omite la iteración
            if (categories.has(channel.parent)) return;

            //Añade la categoría al set
            categories.add(channel.parent);
        });

        //Envía un embed con el resultado
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setAuthor({ name: client.functions.localeParser(locale.embed.author, { guildName: message.guild.name }), iconURL: message.guild.iconURL({dynamic: true}) })
            .setDescription(message.guild.description)
            .setThumbnail(message.guild.iconURL({dynamic: true}))
            .addField(`🏷 ${locale.embed.name}`, message.guild.name, true)
            .addField(`🆔 ${locale.embed.id}`, message.guild.id, true)
            .addField(`🌍 ${locale.embed.region}`, message.guild.preferredLocale, true)
            .addField(`📝 ${locale.embed.creationDate}`, `<t:${Math.round(message.guild.createdTimestamp / 1000)}>`, true)
            .addField(`👑 ${locale.embed.owner}`, `<@${message.guild.ownerId}> (ID: ${message.guild.ownerId})`, true)
            .addField(`🚫 ${locale.embed.nsfwFilter}`, locale.guildNsfwLevel[message.guild.explicitContentFilter], true)
            .addField(`💎 ${locale.embed.tier}`, `${locale.guildTiers[client.homeGuild.premiumTier]} (${client.functions.localeParser(locale.embed.boostsCount, { boostsCount: message.guild.premiumSubscriptionCount })})`, true)
            .addField(`👮 ${locale.embed.verification}`, locale.guildverificationLevel[message.guild.verificationLevel], true)
            .addField(`🎟️ ${locale.embed.invitations}`, client.functions.localeParser(locale.embed.totalInvites, { totalInvites: (await message.guild.invites.fetch()).size.toString() }), true)
            .addField(`🔖 ${locale.embed.roles}`, client.functions.localeParser(locale.embed.totalRoles, { totalRoles: (await message.guild.roles.fetch()).size.toString() }), true)
            .addField(`🌝 ${locale.embed.stickersAndEmojis}`, `${client.functions.localeParser(locale.embed.totalEmojis, { totalEmojis: (await message.guild.emojis.fetch()).size.toString() })}\n${client.functions.localeParser(locale.embed.totalStickers, { totalStickers: (await message.guild.stickers.fetch()).size.toString() })}`, true)
            .addField(`👥 ${locale.embed.members}`, `${client.functions.localeParser(locale.embed.totalMembers, { totalMembers: guildMembers.size })}\n${client.functions.localeParser(locale.embed.totalHumans, { totalHumans: guildMembers.filter(member => !member.user.bot).size })}\n${client.functions.localeParser(locale.embed.totalBots, { totalBots: guildMembers.filter(member => member.user.bot).size })}`, true)
            .addField(`🔨 ${locale.embed.bans}`, client.functions.localeParser(locale.embed.bannedUsers, { bannedUsers: (await message.guild.bans.fetch()).size.toString() }), true)
            .addField(`🕗 ${locale.embed.afk}`, client.functions.localeParser(locale.embed.afkTime, { afkTime: message.guild.afkTimeout / 60 }), true)
            .addField(`💬 ${locale.embed.channels}`, `${client.functions.localeParser(locale.embed.totalCategories, { totalCategories: categories.size - 1 })}\n${client.functions.localeParser(locale.embed.totalTextChannels, { totalTextChannels: guildChannels.filter(c => c.type === 'GUILD_TEXT').size })}\n${client.functions.localeParser(locale.embed.totalVoiceChannels, { totalVoiceChannels: guildChannels.filter(c => c.type === 'GUILD_VOICE').size })}`, true)
            .addField(`⭐ ${locale.embed.features}`, `\`\`\`${translatedFeatures.join(', ')}\`\`\``)
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'serverinfo',
    aliases: ['server', 'guildinfo', 'guild']
};
