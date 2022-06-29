exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.utilities.fetch.run(client, 'member', interaction.options._hoistedOptions[0].value);

        //Almacena el ID del miembro
        const memberId = member ? member.id : interaction.options._hoistedOptions[0].value;

        //Devuelve un error si se ha proporcionado un bot
        if (member && member.user.bot) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});
        
        //Comprueba si se ha aportado alguna advertencia
        const warnIdOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.id.name);
        const warnId = warnIdOption ? warnIdOption.value : null;

        //Almacena la razón y la capitaliza, si se ha aportado
        const reasonOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.reason.name);
        const reason = reasonOption ? `${reasonOption.value.charAt(0).toUpperCase()}${reasonOption.value.slice(1)}` : null;

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
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (member && interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});

        //Comprueba si el miembro tiene warns
        if (!client.db.warns[memberId]) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.noWarns}`)
        ], ephemeral: true});

        //Almacena si el miembro puede borrar cualquiera
        const canRemoveAny = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.removeAny});

        //Crear variables para almacenar los embeds a enviar
        let successEmbed, loggingEmbed, toDMEmbed;

        //Si hay que eliminar todas las infracciones
        if (!warnId) {

            //Comprueba si el miembro puede eliminar cualquier advertencia
            if (!canRemoveAny) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantRemoveAny}.`)
            ], ephemeral: true});

            //Genera un mensaje para el canal de registros
            loggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle(`📑 ${locale.loggingEmbedAll.title}`)
                .setDescription(locale.loggingEmbedAll.description)
                .addField(locale.loggingEmbedAll.date, `<t:${Math.round(new Date() / 1000)}>`, true)
                .addField(locale.loggingEmbedAll.moderator, interaction.user.tag, true)
                .addField(locale.loggingEmbedAll.reason, reason || locale.undefinedReason, true)
                .addField(locale.loggingEmbedAll.memberId, memberId.toString(), true);

            //Genera una notificación de la acción para el canal de invocación
            successEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbedAll.title}`)
                .setDescription(await client.functions.utilities.parseLocale.run(locale.notificationEmbedAll.description, { member: member ? member.user.tag : `${memberId} (ID)` }));

            //Si se encontró al miembro, añade su tag al registro
            member ? loggingEmbed.addField(locale.loggingEmbedAll.member, member.user.tag, true) : null;

            //Genera una notificación para el miembro
            if (member) toDMEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor({ name: locale.privateEmbedAll.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale.run(locale.privateEmbedAll.description, { member: member }))
                .addField(locale.privateEmbedAll.moderator, interaction.user.tag, true)
                .addField(locale.privateEmbedAll.reason, reason || locale.undefinedReason, true);

            //Elimina la entrada de la base de datos
            delete client.db.warns[memberId];

        } else { //Si solo hay que eliminar una infracción

            //Comprueba si la advertencia existe en la BD
            if (!client.db.warns[memberId][warnId]) return interaction.reply({ embeds: [new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.warnNotFound, { warnId: warnId })}`)
            ], ephemeral: true});

            //Comprueba si puede borrar esta advertencia
            if (client.db.warns[memberId][warnId].moderator !== interaction.member.id && !canRemoveAny) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantRemoveAny}.`)
            ], ephemeral: true});

            //Genera un mensaje para el canal de registros
            loggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle(`📑 ${locale.loggingEmbedSingle.title}`)
                .setDescription(locale.loggingEmbedSingle.description)
                .addField(locale.loggingEmbedSingle.date, `<t:${Math.round(new Date() / 1000)}>`, true)
                .addField(locale.loggingEmbedSingle.moderator, interaction.user.tag, true)
                .addField(locale.loggingEmbedSingle.warnId, warnId, true)
                .addField(locale.loggingEmbedSingle.warn, client.db.warns[memberId][warnId].reason, true)
                .addField(locale.loggingEmbedSingle.reason, reason || locale.undefinedReason, true)
                .addField(locale.loggingEmbedSingle.memberId, memberId.toString(), true);

            //Genera una notificación de la acción para el canal de invocación
            successEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbedSingle.title}`)
                .setDescription(await client.functions.utilities.parseLocale.run(locale.notificationEmbedSingle.description, { warnId: warnId, member: member ? member.user.tag : `${memberId} (ID)` }));

            //Si se encontró al miembro, añade su tag al registro
            member ? loggingEmbed.addField(locale.loggingEmbedSingle.member, member.user.tag, true) : null;

            //Genera una notificación para el miembro
            if (member) toDMEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor({ name: locale.privateEmbedSingle.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale.run(locale.privateEmbedSingle.description, { member: member, warnId: warnId }))
                .addField(locale.privateEmbedSingle.moderator, interaction.user.tag, true)
                .addField(locale.privateEmbedSingle.warnId, warnId, true)
                .addField(locale.privateEmbedSingle.warn, client.db.warns[memberId][warnId].reason, true)
                .addField(locale.privateEmbedSingle.reason, reason || locale.undefinedReason, true);

            //Resta el warn indicado
            delete client.db.warns[memberId][warnId];
            
            //Si se queda en 0 warns, se borra la entrada del JSON
            if (Object.keys(client.db.warns[memberId]).length === 0) delete client.db.warns[memberId];
        };

        //Escribe el resultado en el JSON
        client.fs.writeFile('./storage/databases/warns.json', JSON.stringify(client.db.warns, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Envía un registro al canal de registros
            if (client.config.logging.warnRemoved) await client.functions.managers.logging.run(client, 'embed', loggingEmbed);

            //Envía una notificación de la acción en el canal de invocación
            await interaction.reply({ embeds: [successEmbed] });

            //Envía un mensaje de confirmación al miembro
            if (member) await member.send({ embeds: [toDMEmbed] });
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
                optionName: 'id',
                type: 'STRING',
                required: false
            },
            {
                optionName: 'reason',
                type: 'STRING',
                required: false
            }
        ]
    }
};
