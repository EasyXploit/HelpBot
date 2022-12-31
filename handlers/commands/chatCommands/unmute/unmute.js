exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.utilities.fetch.run(client, 'member', interaction.options._hoistedOptions[0].value);

        //Almacena el ID del miembro
        const memberId = member ? member.id : interaction.options._hoistedOptions[0].value;

        //Almacena la razón
        let reason = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : null;

        //Capitaliza la razón
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        //Si no se ha proporcionado razón
        if (!reason) {

            //Almacena si el miembro puede omitir la razón
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.reasonNotNeeded});

            //Si no está autorizado, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}.`)
            ], ephemeral: true});
        };

        //Comprueba si el miembro no estaba silenciado
        if (member && (!member.communicationDisabledUntilTimestamp || member.communicationDisabledUntilTimestamp <= Date.now())) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.notSilenced}.`)
        ], ephemeral: true});

        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (member && interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= sortedRoles[0].position) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.badHierarchy, { interactionAuthor: interaction.member })}.`)
        ], ephemeral: true});

        //Almacena si el miembro puede borrar cualquier muteo
        const canRemoveAny = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.removeAny});

        //Devuelve el estado de autorización
        if (!canRemoveAny && (!client.db.mutes[memberId] || client.db.mutes[memberId].moderator !== interaction.member.id)) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.cantRemoveAny, { interactionAuthor: interaction.member })}.`)
        ], ephemeral: true});

        //Si el silenciamiento estaba registrado en la base de datos
        if (client.db.mutes[memberId]) {

            //Elimina la entrada de la base de datos
            delete client.db.mutes[memberId];

            //Sobreescribe el fichero de la base de datos con los cambios
            await client.fs.writeFile('./storage/databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {

                //Si hubo un error, lo lanza a la consola
                if (err) throw err;
            });
        };

        //Si no hay caché de registros
        if (!client.loggingCache) client.loggingCache = {};

        //Crea una nueva entrada en la caché de registros
        if (member) client.loggingCache[memberId] = {
            action: 'unmute',
            executor: interaction.member.id,
            reason: reason || locale.undefinedReason
        };

        //Habilita la comunicación del miembro en el servidor
        if (member) await member.disableCommunicationUntil(null, reason || locale.undefinedReason);

        //Si el miembro no está en la guild
        if (!member) {

            //Envía un mensaje al canal de registros
            if (client.config.logging.unmutedMember) await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor(locale.loggingEmbed.author)
                .addFields(
                    { name: locale.loggingEmbed.memberId, value: member.id.toString(), inline: true },
                    { name: locale.loggingEmbed.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.loggingEmbed.reason, value: reason || locale.undefinedReason, inline: true }
                )
            );
        };

        //Notifica la acción en el canal de invocación
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryCorrect)
            .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbed.title}`)
            .setDescription(await client.functions.utilities.parseLocale.run(locale.notificationEmbed.description, { member: member ? member.user.tag : `${memberId} (ID)` }))
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
            }
        ]
    }
};
