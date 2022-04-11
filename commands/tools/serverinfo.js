exports.run = async (client, message, args, command, commandConfig) => {

    try {

        //Almacena a los miembros de la guild
        const guildMembers = await message.guild.members.fetch();

        //Almacena los canales de la guild
        const guildChannels = await message.guild.channels.fetch();

        //Almacena las traducciones de las características
        const translations = require('../../resources/translations/guildFeatures.json');

        //Almacena las características traducidas
        let translatedFeatures = [];

        //Traduce las características de la guild
        await message.guild.features.forEach(async (feature) => translatedFeatures.push(translations[feature] || permission));
        
        //Almacena las categorías que hay en la guild
        let categories = new Set();

        //Por cada canal de la guild
        message.guild.channels.cache.filter(channel => {

            //Si ya estaba en el set, omite la iteración
            if (categories.has(channel.parent)) return;

            //Añade la categoría al set
            categories.add(channel.parent);
        });

        //Cálculo del tier de la guild
        let guildTier;
        switch (client.homeGuild.premiumTier) {
            case 'NONE': guildTier = 'Tier 0'; break;
            case 'TIER_1': guildTier = 'Tier 1'; break;
            case 'TIER_2': guildTier = 'Tier 2'; break;
            case 'TIER_3': guildTier = 'Tier 3'; break;
        };

        //Cálculo del nivel de filtro NSFW
        let guildNSFWLevel;
        switch (message.guild.explicitContentFilter) {
            case 'DISABLED':guildNSFWLevel = 'Deshabilitado'; break;
            case 'MEMBERS_WITHOUT_ROLES': guildNSFWLevel = 'Supervisando a miembros sin rol'; break;
            case 'ALL_MEMBERS': guildNSFWLevel = 'Supervisando a todo el mundo'; break;
        };

        //Cálculo del nivel de verificación
        let guildverificationLevel;
        switch (message.guild.verificationLevel) {
            case 'NONE': guildverificationLevel = 'Deshabilitado'; break;
            case 'LOW': guildverificationLevel = 'Bajo'; break;
            case 'MEDIUM': guildverificationLevel = 'Medio'; break;
            case 'HIGH': guildverificationLevel = 'Alto'; break;
            case 'VERY_HIGH': guildverificationLevel = 'Muy alto'; break;
        };

        //Envía un embed con el resultado
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setAuthor({ name: `Información sobre ${message.guild.name}`, iconURL: message.guild.iconURL({dynamic: true}) })
            .setDescription(message.guild.description)
            .setThumbnail(message.guild.iconURL({dynamic: true}))
            .addField('🏷 Nombre', message.guild.name, true)
            .addField('🆔 ID', message.guild.id, true)
            .addField('🌍 Región', message.guild.preferredLocale, true)
            .addField('📝 Fecha de creación', `<t:${Math.round(message.guild.createdTimestamp / 1000)}>`, true)
            .addField('👑 Propietario', `<@${message.guild.ownerId}> (ID: ${message.guild.ownerId})`, true)
            .addField('🚫 Filtro NSFW', guildNSFWLevel, true)
            .addField('💎 Nivel de mejora', `${guildTier} (${message.guild.premiumSubscriptionCount} mejoras)`, true)
            .addField('👮 Nivel de verificación', guildverificationLevel, true)
            .addField('🎟️ Invitaciones', `${(await message.guild.invites.fetch()).size.toString()} invitaciones en total`, true)
            .addField('🔖 Roles', `${(await message.guild.roles.fetch()).size.toString()} roles en total`, true)
            .addField('🌝 Stickers y Emojis', `${(await message.guild.emojis.fetch()).size.toString()} emojis\n${(await message.guild.stickers.fetch()).size.toString()} stickers`, true)
            .addField('👥 Miembros', `${guildMembers.size} miembros\n${guildMembers.filter(m => !m.user.bot).size} humanos\n${guildMembers.filter(m => m.user.bot).size} bots`, true)
            .addField('🔨 Baneos', `${(await message.guild.bans.fetch()).size.toString()} usuarios baneados`, true)
            .addField('🕗 Tiempo para AFK', `${message.guild.afkTimeout / 60} minutos`, true)
            .addField('💬 Canales', `${(categories.size - 1)} categorías\n${guildChannels.filter(c => c.type === 'GUILD_TEXT').size} canales de texto\n${guildChannels.filter(c => c.type === 'GUILD_VOICE').size} canales de voz`, true)
            .addField('⭐ Características', `\`\`\`${translatedFeatures.join(', ')}\`\`\``)
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'serverinfo',
    description: 'Muestra información sobre el servidor.',
    aliases: ['server'],
    parameters: ''
};
