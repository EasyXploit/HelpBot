exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.utilities.fetch.run(client, 'member', interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        //Si el miembro era un bot
        if (member.user.bot) {

            //Almacena si el miembro puede silenciar bots
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.botsAllowed});

            //Si no está autorizado para ello, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
            ], ephemeral: true});
        };
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await client.functions.moderation.checkMutedRole.run(client, interaction.guild);

        //Comprueba si el miembro ya tenía el rol silenciado
        if (member.roles.cache.has(mutedRole.id)) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.alreadySilenced}.`)
        ], ephemeral: true});

        //Almacena la razón
        let reason = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : null;

        //Capitaliza la razón
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        //Si no se ha proporcionado razón y el miembro no es el dueño
        if (!reason && interaction.member.id !== interaction.guild.ownerId) {

            //Almacena si el miembro puede omitir la razón
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.reasonNotNeeded});

            //Si no está autorizado, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}.`)
            ], ephemeral: true});
        };

        //Guarda el silenciamiento en la base de datos
        client.db.mutes[member.id] = {
            until: null,
            moderator: interaction.member.id
        };

        //Sobreescribe el fichero de la base de datos con los cambios
        client.fs.writeFile('./storage/databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Añade el rol silenciado al miembro
            member.roles.add(mutedRole);

            //Propaga el rol silenciado
            await client.functions.moderation.spreadMutedRole.run(client, interaction.guild);

            //Envía un mensaje al canal de registros
            if (client.config.logging.mutedMember) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: await client.functions.utilities.parseLocale.run(locale.loggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .addField(locale.loggingEmbed.memberId, member.id, true)
                .addField(locale.loggingEmbed.moderator, interaction.user.tag, true)
                .addField(locale.loggingEmbed.reason, reason || locale.undefinedReason, true)
                .addField(locale.loggingEmbed.expiration, locale.loggingEmbed.noExpiration, true)
            );

            //Genera una descripción para el embed de notificación
            const notificationEmbedDescription = reason ? await client.functions.utilities.parseLocale.run(locale.notificationEmbed.withReason, { memberTag: member.user.tag, reason: reason }) : await client.functions.utilities.parseLocale.run(locale.notificationEmbed.withoutReason, { memberTag: member.user.tag })

            //Notifica la acción en el canal de invocación
            await interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
            ]});

            //Envía una notificación al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale.run(locale.privateEmbed.description, { member: member, guildName: interaction.guild.name }))
                .addField(locale.privateEmbed.moderator, interaction.user.tag, true)
                .addField(locale.privateEmbed.reason, reason || locale.undefinedReason, true)
                .addField(locale.privateEmbed.expiration, locale.privateEmbed.noExpiration, true)
            ]});
        });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
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
