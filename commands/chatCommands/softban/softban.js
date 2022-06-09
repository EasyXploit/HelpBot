exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {
        
        //Busca al usuario proporcionado
        const user = await client.functions.fetchUser(interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al usuario
        if (!user) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.userNotFound}.`)
        ], ephemeral: true});

        //Si el usuario era un bot
        if (user.bot) {

            //Almacena si el miembro puede banear bots
            let authorized;

            //Por cada uno de los roles que pueden banear bots
            for (let index = 0; index < commandConfig.botsAllowed; index++) {

                //Comprueba si el miembro ejecutor lo tiene
                if (interaction.member.roles.cache.has(commandConfig.botsAllowed[index])) {
                    authorized = true;
                    break;
                };
            };

            //Si no está autorizado para ello, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
            ], ephemeral: true});
        };

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(user.id);

        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (member && (interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) || !member.bannable) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});
        
        //Se comprueba si el usuario ya estaba baneado
        const guildBans = await interaction.guild.bans.fetch();

        //Comprueba si el usuario ya estaba baneado
        for (const bans of guildBans) {

            //Si el usuario ya estaba baneado, devuelve un error
            if (bans[0] === user.id) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyBanned}.`)
            ], ephemeral: true});
        };

        //Calcula los días de mensajes a borrar
        const days = interaction.options._hoistedOptions[1].value;

        //Almacena la razón
        let reason = interaction.options._hoistedOptions[2] ? interaction.options._hoistedOptions[2].value : null;

        //Capitaliza la razón
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        //Si no se ha proporcionado razón y el miembro no es el dueño
        if (!reason && interaction.member.id !== interaction.guild.ownerId) {

            //Almacena si el miembro puede omitir la razón
            let authorized;

            //Por cada uno de los roles que pueden omitir la razón
            for (let index = 0; index < commandConfig.reasonNotNeeded; index++) {

                //Comprueba si el miembro ejecutor lo tiene
                if (interaction.member.roles.cache.has(commandConfig.reasonNotNeeded[index])) {
                    authorized = true;
                    break;
                };
            };

            //Si no está autorizado, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}.`)
            ], ephemeral: true});
        };

        //Si no hay caché de registros
        if (!client.loggingCache) client.loggingCache = {};

        //Crea una nueva entrada en la caché de registros
        client.loggingCache[user.id] = {
            action: 'softban',
            executor: interaction.member.id,
            reason: reason || locale.undefinedReason,
            deletedDays: days.toString()
        };

        //Envía una notificación al miembro
        if (member) await user.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
            .setDescription(client.functions.localeParser(locale.privateEmbed.description, { user: user, guildName: interaction.guild.name }))
            .addField(locale.privateEmbed.moderator, interaction.user.tag, true)
            .addField(locale.privateEmbed.reason, reason || locale.undefinedReason, true)
            .addField(locale.privateEmbed.deletedDays, days.toString(), true)
            .addField(locale.privateEmbed.expiration, locale.privateEmbed.noExpiration, true)
        ]});

        //Banea al miembro y borra sus mensajes
        await interaction.guild.members.ban(user, { days: days, reason: reason || locale.undefinedReason });

        //Genera una descripción para el embed de notificación
        const notificationEmbedDescription = reason ? client.functions.localeParser(locale.notificationEmbed.withReason, { userTag: user.tag, reason: reason }) : client.functions.localeParser(locale.notificationEmbed.withoutReason, { userTag: user.tag })

        //Notifica la acción en el canal de invocación
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
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
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'user',
                type: 'USER',
                required: true
            },
            {
                optionName: 'days',
                type: 'INTEGER',
                minValue: 1,
                maxValue: 7,
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
