exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Busca el miembro en la guild
        const member = await client.functions.utilities.fetch.run(client, 'member', interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : interaction.member.id);

        //Comprueba si se ha proporcionado un miembro válido
        if (!member) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidMember}.`)
        ], ephemeral: true});

        //Comprueba, si corresponde, que el miembro tenga permiso para ver los datos de otros
        if (interaction.member.id !== member.id) {

            //Variable para saber si está autorizado
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.canSeeAny});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantSeeAny}.`)
            ], ephemeral: true});
        };

        //Comprueba los status de los que dispone el miembro
        let status = [];
        if (member.id === interaction.guild.ownerId) status.push(locale.memberType.owner);
        if (member.permissions.has('ADMINISTRATOR')) status.push(locale.memberType.administrator);
        if (member.permissions.has('MANAGE_MESSAGES')) status.push(locale.memberType.moderator);
        if (status.length < 1) status.push(locale.memberType.regular);

        //Almacena la sanción actual, si aplica
        let sanction;

        //Comprueba qué tipo de sanción tiene el miembro (si la tiene, según duración)
        if (client.db.mutes[member.id] && client.db.mutes[member.id].until) sanction = `${locale.embed.mutedUntil}: <t:${Math.round(new Date(client.db.mutes[member.id].until) / 1000)}>`;
        else if (client.db.mutes[member.id] && !client.db.mutes[member.id].until) sanction = locale.embed.undefinedMute;

        //Envía un embed con el resultado del comando
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(member.displayHexColor)
            .setTitle(await client.functions.utilities.parseLocale.run(locale.embed.title, { memberDisplayName: member.displayName }))
            .setDescription(await client.functions.utilities.parseLocale.run(locale.embed.description, { memberTag: member.user.tag }))
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .addField(`🆔 ${locale.embed.memberId}`, member.id, true)
            .addField(`📝 ${locale.embed.registerDate}`, `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, true)
            .addField(`↙ ${locale.embed.joinDate}`, `<t:${Math.round(member.joinedTimestamp / 1000)}>`, true)
            .addField(`👑 ${locale.embed.status}`, status.join(', '), true)
            .addField(`💎 ${locale.embed.nitroBooster}`, member.premiumSince ? await client.functions.utilities.parseLocale.run(locale.embed.isBooster, { time: `<t:${Math.round(member.premiumSinceTimestamp / 1000)}>` }) : locale.embed.isntBooster, true)
            .addField(`🎖 ${locale.embed.highestRole}`, member.roles.highest.name, true)
            .addField(`⚖ ${locale.embed.infractions}`, client.db.warns[member.id] ? (Object.keys(client.db.warns[member.id]).length).toString() : '0', true)
            .addField(`📓 ${locale.embed.verification}`, member.pending ? locale.embed.isntVerified : locale.embed.isVerified, true)
            .addField(`⚠️ ${locale.embed.actualSanction}`, sanction || locale.embed.noSanction, true)
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: true,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'user',
                type: 'USER',
                required: false
            }
        ]
    }
};
