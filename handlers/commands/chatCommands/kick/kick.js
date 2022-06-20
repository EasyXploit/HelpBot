exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        //Si el miembro era un bot
        if (member.user.bot) {

            //Almacena si el miembro puede expulsar bots
            let authorized;

            //Por cada uno de los roles que pueden expulsar bots
            for (let index = 0; index < commandConfig.botsAllowed.length; index++) {

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
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if ((interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) || !member.bannable) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});

        //Almacena la razón
        let reason = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : null;

        //Capitaliza la razón
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        //Si no se ha proporcionado razón y el miembro no es el dueño
        if (!reason && interaction.member.id !== interaction.guild.ownerId) {

            //Almacena si el miembro puede omitir la razón
            let authorized;

            //Por cada uno de los roles que pueden omitir la razón
            for (let index = 0; index < commandConfig.reasonNotNeeded.length; index++) {

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
        client.loggingCache[member.id] = {
            action: 'kick',
            executor: interaction.member.id,
            reason: reason || locale.undefinedReason
        };

        //Genera una descripción para el embed de notificación
        const notificationEmbedDescription = reason ? client.functions.localeParser(locale.notificationEmbed.withReason, { memberTag: member.user.tag, reason: reason }) : client.functions.localeParser(locale.notificationEmbed.withoutReason, { memberTag: member.user.tag })

        //Notifica la acción en el canal de invocación
        await interaction.reply({embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
        ]});
        
        //Envía una notificación al miembro
        await member.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
            .setDescription(client.functions.localeParser(locale.privateEmbed.description, { member: member, guildName: interaction.guild.name }))
            .addField(locale.privateEmbed.moderator, interaction.user.tag, true)
            .addField(locale.privateEmbed.reason, reason || locale.undefinedReason, true)
        ]});

        //Expulsa al miembro
        await member.kick(reason || locale.undefinedReason);
        
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
                optionName: 'reason',
                type: 'STRING',
                required: false
            }
        ]
    }
};
