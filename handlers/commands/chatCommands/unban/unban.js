exports.run = async (interaction, commandConfig, locale) => {
    
    try {

        //Busca al usuario proporcionado
        const user = await client.functions.utilities.fetch('user', interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al usuario
        if (!user) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.userNotFound}.`)
        ], ephemeral: true});

        //Almacena la razón
        let reason = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : null;

        //Capitaliza la razón
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        //Si no se ha proporcionado razón y el miembro no es el dueño
        if (!reason && interaction.member.id !== interaction.guild.ownerId) {

            //Almacena si el miembro puede omitir la razón
            const authorized = await client.functions.utilities.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.reasonNotNeeded});

            //Si no está autorizado, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}.`)
            ], ephemeral: true});
        };

        //Se comprueba si el usuario ya estaba baneado
        const guildBans = await interaction.guild.bans.fetch();

        //Almacena el estado de baneo del usuario
        let banned = false;

        //Por cada uno de los baneos de la guild
        for (const bans of guildBans) {

            //Comprueba si el ID del usuario coincide con el del baneo
            if (bans[0] === user.id) banned = true
        };

        //Si el usuario no estaba baneado, devuelve un error
        if (!banned) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.notBanned}.`)
        ], ephemeral: true});

        //Desbanea al miembro
        await interaction.guild.members.unban(user.id);
        
        //Si el baneo estaba registrado en la base de datos
        if (await client.functions.db.getData('ban', user.id)) {

            //Elimina la entrada de la base de datos
            await client.functions.db.delData('ban', user.id);
        };

        //Envía un mensaje al canal de registros
        await client.functions.managers.sendLog('unbannedMember', 'embed', new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
            .setAuthor({ name: await client.functions.utilities.parseLocale(locale.loggingEmbed.author, { userTag: user.tag }), iconURL: user.displayAvatarURL({dynamic: true}) })
            .addFields(
                { name: locale.loggingEmbed.userId, value: user.id.toString(), inline: true },
                { name: locale.loggingEmbed.moderator, value: interaction.user.tag, inline: true },
                { name: locale.loggingEmbed.reason, value: reason || locale.undefinedReason, inline: true }
            )
        );

        //Notifica la acción en el canal de invocación
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
            .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbed.title}`)
            .setDescription(await client.functions.utilities.parseLocale(locale.loggingEmbed.author, { userTag: user.tag }))
        ]});
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultMemberPermissions: new client.Permissions('ADMINISTRATOR'),
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'user',
                type: 'USER',
                required: true
            },
            {
                optionName: 'reason',
                type: 'STRING',
                required: false
            }
        ]
    }
};
