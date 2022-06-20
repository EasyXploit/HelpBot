exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        //Si el miembro era un bot
        if (member.user.bot) {

            //Almacena si el miembro puede silenciar bots
            let authorized;

            //Por cada uno de los roles que pueden silenciar bots
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
        if (interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await client.functions.checkMutedRole(interaction.guild);

        //Comprueba si el miembro ya tenía el rol silenciado
        if (member.roles.cache.has(mutedRole.id)) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.alreadySilenced}.`)
        ], ephemeral: true});
        
        //Comprueba la longitud del tiempo proporcionado
        if (interaction.options._hoistedOptions[1].value.length < 2) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.wrongMagnitudes}.`)
        ], ephemeral: true});

        //Calcula el tiempo estimado en milisegundos
        const milliseconds = await client.functions.magnitudesToMs(interaction.options._hoistedOptions[1].value);

        //Comprueba si se ha proporcionado un tiempo válido
        if (!milliseconds) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.wrongMagnitudes}.`)
        ], ephemeral: true});

        //Almacena si el miembro puede silenciar
        let authorized;

        //Para cada ID de rol de la lista blanca
        for (let index = 0; index < commandConfig.unlimitedTime.length; index++) {

            //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
            if (interaction.member.id === interaction.guild.ownerId || interaction.member.roles.cache.find(role => role.id === client.config.main.botManagerRole) || interaction.member.roles.cache.find(role => role.id === commandConfig.unlimitedTime[index])) {
                authorized = true;
                break;
            };
        };

        //Si no se permitió la ejecución, manda un mensaje de error
        if (!authorized && milliseconds > commandConfig.maxRegularTime) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.exceededDuration, { time: client.functions.msToDHHMMSS(commandConfig.maxRegularTime) })}.`)
        ], ephemeral: true});

        //Almacena la razón
        let reason = interaction.options._hoistedOptions[2] ? interaction.options._hoistedOptions[2].value : null;

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

        //Guarda el silenciamiento en la base de datos
        client.db.mutes[member.id] = {
            until: Date.now() + milliseconds,
            moderator: interaction.member.id
        };

        //Sobreescribe el fichero de la base de datos con los cambios
        client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Silencia al miembro
            member.roles.add(mutedRole);

            //Propaga el rol silenciado
            client.functions.spreadMutedRole(interaction.guild);

            //Envía un mensaje al canal de registros
            await client.functions.loggingManager('embed', new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: client.functions.localeParser(locale.loggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .addField(locale.loggingEmbed.memberId, member.id, true)
                .addField(locale.loggingEmbed.moderator, interaction.user.tag, true)
                .addField(locale.loggingEmbed.reason, reason || locale.undefinedReason, true)
                .addField(locale.loggingEmbed.expiration, `<t:${Math.round(new Date(parseInt(Date.now() + milliseconds)) / 1000)}:R>`, true)
            );

            //Genera una descripción para el embed de notificación
            const notificationEmbedDescription = reason ? client.functions.localeParser(locale.notificationEmbed.withReason, { memberTag: member.user.tag, reason: reason }) : client.functions.localeParser(locale.notificationEmbed.withoutReason, { memberTag: member.user.tag })

            //Notifica la acción en el canal de invocación
            await interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
            ]});

            //Envía una notificación al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(client.functions.localeParser(locale.privateEmbed.description, { member: member, guildName: interaction.guild.name }))
                .addField(locale.privateEmbed.moderator, interaction.user.tag, true)
                .addField(locale.privateEmbed.reason, reason || locale.undefinedReason, true)
                .addField(locale.privateEmbed.expiration, `<t:${Math.round(new Date(parseInt(Date.now() + milliseconds)) / 1000)}:R>`, true)
            ]});
        });
        
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
                optionName: 'duration',
                type: 'STRING',
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
