exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {
        
        //Busca al usuario proporcionado
        const user = await client.functions.fetchUser(interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al usuario
        if (!user) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.userNotFound}`)
        ], ephemeral: true});

        //Si el usuario era un bot
        if (user.bot) {

            //Almacena si el miembro puede banear bots
            let authorized;

            //Por cada uno de los roles que pueden banear bots
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
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}`)
            ], ephemeral: true});
        };

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(user.id);

        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (member && ((interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) || !member.bannable)) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}`)
        ], ephemeral: true});
        
        //Se comprueba si el usuario ya estaba baneado
        const guildBans = await interaction.guild.bans.fetch();

        //Comprueba si el usuario ya estaba baneado
        for (const bans of guildBans) {

            //Si el usuario ya estaba baneado, devuelve un error
            if (bans[0] === user.id) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyBanned}`)
            ], ephemeral: true});
        };

        //Almacena la duración provista
        const durationOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.duration.name);
        const providedDuration = durationOption ? durationOption.value : null;

        //Si no se ha proporcionado una duración
        if (!providedDuration) {

            //Almacena si el miembro puede banear indefinidamente
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
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantPermaBan}.`)
            ], ephemeral: true});
        };

        //Almacena los milisegundos de la duración
        let milliseconds;

        //Si se ha proporcionado una duración para el baneo
        if (providedDuration) {

            //Comprueba la longitud del tiempo proporcionado
            if (providedDuration.length < 2) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.wrongMagnitudes}.`)
            ], ephemeral: true});

            //Calcula el tiempo estimado en milisegundos
            milliseconds = await client.functions.magnitudesToMs(providedDuration);

            //Comprueba si se ha proporcionado un tiempo válido
            if (!milliseconds) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.wrongMagnitudes}.`)
            ], ephemeral: true});

            //Almacena si el miembro puede banear
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
                .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.exceededDuration, { time: client.functions.msToTime(commandConfig.maxRegularTime) })}.`)
            ], ephemeral: true});
        };

        //Almacena los días de mensajes borrados
        const deletedDaysOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.days.name);
        const deletedDays = deletedDaysOption ? deletedDaysOption.value : null;

        //Si no se ha proporcionado una duración
        if (deletedDays) {

            //Almacena si el miembro puede banear indefinidamente
            let authorized;

            //Para cada ID de rol de la lista blanca
            for (let index = 0; index < commandConfig.canSoftBan.length; index++) {

                //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                if (interaction.member.id === interaction.guild.ownerId || interaction.member.roles.cache.find(role => role.id === client.config.main.botManagerRole) || interaction.member.roles.cache.find(role => role.id === commandConfig.canSoftBan[index])) {
                    authorized = true;
                    break;
                };
            };

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantSoftBan}.`)
            ], ephemeral: true});
        };
        
        //Almacena la razón
        const reasonOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.reason.name);
        let reason = reasonOption ? reasonOption.value : null;

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
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}`)
            ], ephemeral: true});
        };

        //Almacena la expiración del baneo
        const expiration = milliseconds ? Date.now() + milliseconds : null;

        //Si no hay caché de registros
        if (!client.loggingCache) client.loggingCache = {};

        //Crea una nueva entrada en la caché de registros
        client.loggingCache[user.id] = {
            action: 'ban',
            executor: interaction.member.id,
            reason: reason || locale.undefinedReason,
            deletedDays: deletedDays ? deletedDays.toString() : null,
            expiration: expiration
        };

        //Si se proporcionó una duración
        if (providedDuration) {

            //Registra el baneo en la base de datos
            client.db.bans[user.id] = {
                until: Date.now() + milliseconds
            };

            //Sobreescribe el fichero de la base de datos con los cambios
            client.fs.writeFile('./databases/bans.json', JSON.stringify(client.db.bans, null, 4), async err => {

                //Si hubo un error, lo lanza a la consola
                if (err) throw err;
            });
        };

        //Almacena los parámetros para el baneo
        const banParameters = { reason: reason || locale.undefinedReason };

        //Si se ha proporcionado borrado de mensajes, almacena el parámetro
        if (deletedDays) banParameters.days = deletedDays;

        //Banea al usuario
        await interaction.guild.members.ban(user, banParameters);

        //Genera una descripción para el embed de notificación
        const notificationEmbedDescription = reason ? client.functions.localeParser(locale.notificationEmbed.withReason, { userTag: user.tag, reason: reason }) : client.functions.localeParser(locale.notificationEmbed.withoutReason, { userTag: user.tag })

        //Envía una confirmación como respuesta a la interacción
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
        ]});
        
        //Envía una notificación al miembro
        if (member) await user.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
            .setDescription(client.functions.localeParser(locale.privateEmbed.description, { user: user, guildName: interaction.guild.name }))
            .addField(locale.privateEmbed.moderator, interaction.user.tag, true)
            .addField(locale.privateEmbed.reason, reason || locale.undefinedReason, true)
            .addField(locale.privateEmbed.expiration, expiration ? `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>` : locale.privateEmbed.noExpiration, true)
            .addField(locale.privateEmbed.deletedDays, deletedDays ? deletedDays.toString() : `\`${locale.privateEmbed.noDeletedDays}\``, true)
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
                optionName: 'reason',
                type: 'STRING',
                required: false
            },
            {
                optionName: 'days',
                type: 'INTEGER',
                minValue: 1,
                maxValue: 7,
                required: false
            },
            {
                optionName: 'duration',
                type: 'STRING',
                required: false
            }
        ]
    }
};