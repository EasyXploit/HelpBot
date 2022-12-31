exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {
        
        //Busca al usuario proporcionado
        const user = await client.functions.utilities.fetch.run(client, 'user', interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al usuario
        if (!user) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.userNotFound}`)
        ], ephemeral: true});

        //Si el usuario era un bot
        if (user.bot) {

            //Almacena si el miembro puede banear bots
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.botsAllowed});

            //Si no está autorizado para ello, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}`)
            ], ephemeral: true});
        };

        //Busca al miembro proporcionado
        const member = await client.functions.utilities.fetch.run(client, 'member', user.id);

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
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedTime});

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
            milliseconds = await client.functions.utilities.magnitudesToMs.run(providedDuration);

            //Comprueba si se ha proporcionado un tiempo válido
            if (!milliseconds) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.wrongMagnitudes}.`)
            ], ephemeral: true});

            //Almacena si el miembro puede banear
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedTime});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized && milliseconds > commandConfig.maxRegularTime) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.exceededDuration, { time: await client.functions.utilities.msToTime.run(client, commandConfig.maxRegularTime) })}.`)
            ], ephemeral: true});
        };

        //Almacena los días de mensajes borrados
        const deletedDaysOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.days.name);
        const deletedDays = deletedDaysOption ? deletedDaysOption.value : null;

        //Si no se ha proporcionado una duración
        if (deletedDays) {

            //Almacena si el miembro puede banear indefinidamente
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.canSoftBan});

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
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.reasonNotNeeded});

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
            client.fs.writeFile('./storage/databases/bans.json', JSON.stringify(client.db.bans, null, 4), async err => {

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
        const notificationEmbedDescription = reason ? await client.functions.utilities.parseLocale.run(locale.notificationEmbed.withReason, { userTag: user.tag, reason: reason }) : await client.functions.utilities.parseLocale.run(locale.notificationEmbed.withoutReason, { userTag: user.tag })

        //Envía una confirmación como respuesta a la interacción
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
        ]});
        
        //Envía una notificación al miembro
        if (member) await user.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
            .setDescription(await client.functions.utilities.parseLocale.run(locale.privateEmbed.description, { user: user, guildName: interaction.guild.name }))
            .addFields(
                { name: locale.privateEmbed.moderator, value: interaction.user.tag, inline: true },
                { name: locale.privateEmbed.reason, value: reason || locale.undefinedReason, inline: true },
                { name: locale.privateEmbed.expiration, value: expiration ? `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>` : locale.privateEmbed.noExpiration, inline: true },
                { name: locale.privateEmbed.deletedDays, value: deletedDays ? deletedDays.toString() : `\`${locale.privateEmbed.noDeletedDays}\``, inline: true }
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