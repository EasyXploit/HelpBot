exports.run = async (interaction, commandConfig, locale) => {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.utilities.fetch('member', interaction.options._hoistedOptions[0].value);

        //Almacena el ID del miembro
        const memberId = member ? member.id : interaction.options._hoistedOptions[0].value;

        //Devuelve un error si se ha proporcionado un bot
        if (member && member.user.bot) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});
        
        //Comprueba si se ha aportado alguna advertencia
        const warnIdOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.warn.name);
        const warnId = warnIdOption ? warnIdOption.value : null;

        //Almacena la razón y la capitaliza, si se ha aportado
        const reasonOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.reason.name);
        const reason = reasonOption ? `${reasonOption.value.charAt(0).toUpperCase()}${reasonOption.value.slice(1)}` : null;

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
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (member && interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});
        
        //Almacena el perfil del miembro
        let memberProfile = await client.functions.db.getData('profile', member.id);

        //Comprueba si el miembro tiene warns
        if (!memberProfile || memberProfile.moderationLog.warnsHistory.length === 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noWarns}`)
        ], ephemeral: true});

        //Almacena las advertencias del miembro
        let memberWarns = memberProfile.moderationLog.warnsHistory;

        //Almacena si el miembro puede borrar cualquiera
        const canRemoveAny = await client.functions.utilities.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.removeAny});

        //Crear variables para almacenar los embeds a enviar
        let successEmbed, loggingEmbed, toDMEmbed;

        //Si hay que eliminar todas las infracciones
        if (!warnId) {

            //Comprueba si el miembro puede eliminar cualquier advertencia
            if (!canRemoveAny) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantRemoveAny}.`)
            ], ephemeral: true});

            //Genera un mensaje para el canal de registros
            loggingEmbed = new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                .setTitle(`📑 ${locale.loggingEmbedAll.title}`)
                .setDescription(locale.loggingEmbedAll.description)
                .addFields(
                    { name: locale.loggingEmbedAll.date, value: `<t:${Math.round(new Date() / 1000)}>`, inline: true },
                    { name: locale.loggingEmbedAll.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.loggingEmbedAll.reason, value: reason || locale.undefinedReason, inline: true },
                    { name: locale.loggingEmbedAll.memberId, value: memberId.toString(), inline: true }
                );

            //Genera una notificación de la acción para el canal de invocación
            successEmbed = new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbedAll.title}`)
                .setDescription(await client.functions.utilities.parseLocale(locale.notificationEmbedAll.description, { member: member ? member.user.tag : `${memberId} (ID)` }));

            //Si se encontró al miembro, añade su tag al registro
            member ? loggingEmbed.addFields({ name: locale.loggingEmbedAll.member, value: member.user.tag, inline: true }) : null;

            //Genera una notificación para el miembro
            if (member) toDMEmbed = new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                .setAuthor({ name: locale.privateEmbedAll.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale(locale.privateEmbedAll.description, { member: member }))
                .addFields(
                    { name: locale.privateEmbedAll.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.privateEmbedAll.reason, value: reason || locale.undefinedReason, inline: true }
                );

            //Vacía el array de advertencias
            memberWarns = [];

            //Actualiza la base de datos con los cambios
            await client.functions.db.setData('profile', member.id, memberProfile);

        } else { //Si solo hay que eliminar una infracción

            //Almacena la advertencia, si la encuentra
            let foundWarn = false;

            //Por cada una de las advertencias del miembro
            for (let index = 0; index < memberWarns.length; index++) {

                //Si el Id coincide con la búsqueda
                if (memberWarns[index].warnId === warnId) {

                    //Almacena la advertencia
                    foundWarn = memberWarns[index];

                    //Elimina la entrada de la lista
                    memberWarns.splice(index, 1);

                    //Para el bucle
                    break;
                };
            };

            //Envía un mensaje de error si no se encuentra la advertencia
            if (!foundWarn) return interaction.reply({ embeds: [new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale(locale.warnNotFound, { warnId: warnId })}`)
            ], ephemeral: true});

            //Comprueba si puede borrar esta advertencia
            if ((foundWarn.executor.type === 'system' || foundWarn.executor.memberId !== interaction.member.id) && !canRemoveAny) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantRemoveAny}.`)
            ], ephemeral: true});

            //Genera un mensaje para el canal de registros
            loggingEmbed = new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
                .setTitle(`📑 ${locale.loggingEmbedSingle.title}`)
                .setDescription(locale.loggingEmbedSingle.description)
                .addFields(
                    { name: locale.loggingEmbedSingle.date, value: `<t:${Math.round(new Date() / 1000)}>`, inline: true },
                    { name: locale.loggingEmbedSingle.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.loggingEmbedSingle.warnId, value: warnId, inline: true },
                    { name: locale.loggingEmbedSingle.warn, value: foundWarn.reason, inline: true },
                    { name: locale.loggingEmbedSingle.reason, value: reason || locale.undefinedReason, inline: true },
                    { name: locale.loggingEmbedSingle.memberId, value: memberId.toString(), inline: true }
                );

            //Genera una notificación de la acción para el canal de invocación
            successEmbed = new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbedSingle.title}`)
                .setDescription(await client.functions.utilities.parseLocale(locale.notificationEmbedSingle.description, { warnId: warnId, member: member ? member.user.tag : `${memberId} (ID)` }));

            //Si se encontró al miembro, añade su tag al registro
            member ? loggingEmbed.addFields({ name: locale.loggingEmbedSingle.member, value: member.user.tag, inline: true }) : null;

            //Genera una notificación para el miembro
            if (member) toDMEmbed = new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
                .setAuthor({ name: locale.privateEmbedSingle.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utilities.parseLocale(locale.privateEmbedSingle.description, { member: member, warnId: warnId }))
                .addFields(
                    { name: locale.privateEmbedSingle.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.privateEmbedSingle.warnId, value: warnId, inline: true },
                    { name: locale.privateEmbedSingle.warn, value: foundWarn.reason, inline: true },
                    { name: locale.privateEmbedSingle.reason, value: reason || locale.undefinedReason, inline: true }
                );

            //Actualiza la base de datos con los cambios
            await client.functions.db.setData('profile', member.id, memberProfile);
        };

        //Envía un registro al canal de registros
        await client.functions.managers.sendLog('warnRemoved', 'embed', loggingEmbed);

        //Envía una notificación de la acción en el canal de invocación
        await interaction.reply({ embeds: [successEmbed] });

        //Envía un mensaje de confirmación al miembro
        if (member) await member.send({ embeds: [toDMEmbed] });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

//Exporta la función de autocompletado
exports.autocomplete = async (interaction, command, locale) => {

    try {

        //Almacena el ID del miembro objetivo
        const memberId = interaction.options._hoistedOptions[0].value;

        //Almacena el valor parcial que ha introducido el usuario
        const focusedValue = interaction.options.getFocused();

        //Almacena el perfil del miembro
        let memberProfile = await client.functions.db.getData('profile', memberId);

        //Almacena las advertencias del miembro
        let memberWarns = memberProfile ? memberProfile.moderationLog.warnsHistory : null;
        
        //Envía una lista vacía si el usuario no tiene warns
        if (!memberWarns || memberWarns.length === 0) return await interaction.respond(null);

        //Almacena si el miembro puede borrar cualquier advertencia
        const canRemoveAny = await client.functions.utilities.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: command.userConfig.removeAny});

        //Almacena las advertencias de manera cronológica inversa
        const reversedWarns = memberWarns.reverse();

        //Crea un objeto para almacenar los warns mapeados y ordenados
        const sortedWarnsObject = {};

        //Por cada uno de los warns del array de warns coronológicos
        for (const warnData of reversedWarns) {

            //Omite esta advertencia si no fue emitida por el ejecutor del comando, y no tiene permiso para eliminar todas
            if (!canRemoveAny && (warnData.executor.type === 'system' || warnData.executor.memberId !== interaction.member.id)) continue;

            //Genera una fecha a partir de la advertencia
            const warnDate = new Date(warnData.timestamp);
    
            //Obtiene una cadena a partir de la fecha de la advertencia
            const dateString = `${warnDate.getDate()}/${warnDate.getMonth() + 1}/${warnDate.getFullYear()} ${warnDate.getHours()}:${warnDate.getMinutes()}:${warnDate.getSeconds()}`;

            //Obtiene el moderador de la advertencia, o una cadena genérica
            const moderatorUser = warnData.executor.type === 'system' ? locale.autocomplete.systemModerator : await client.functions.utilities.fetch('user', warnData.executor.memberId) || locale.autocomplete.unknownModerator;

            //Genera una cadena para mostrarla cómo resultado
            let warnString = `${warnData.warnId} • ${moderatorUser.tag ? moderatorUser.tag : moderatorUser} • ${dateString} • ${warnData.reason}`;

            //Recorta la cadena si es necesario
            warnString = warnString.length > 100 ? `${warnString.slice(0, 96)} ...` : warnString;

            //Si no se ha proporcionado valor a buscar, o el proporcionado encaja parcialmente, lo almacena en el objeto de warns
            if (focusedValue.length === 0 || warnString.toLowerCase().includes(focusedValue.toLowerCase())) sortedWarnsObject[warnData.warnId] = warnString;
        };

        //Genera un array mapeado a partir del objeto de warns
        const arrayOfWarns = Object.entries(sortedWarnsObject).map((entry) => ( { [entry[0]]: entry[1] } ));

        //Mapea el array de advertencias en par nombre-valor
        let mappedList = arrayOfWarns.map(warn => ({ name: Object.values(warn)[0], value: Object.keys(warn)[0] }));

        //Recorta la lista si es demasiado grande
        mappedList = mappedList.slice(0, 25);

        //Responde a la interacción con la lista
        await interaction.respond(mappedList);

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultMemberPermissions: new client.Permissions('MODERATE_MEMBERS'),
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
                optionName: 'warn',
                type: 'STRING',
                required: false,
                autocomplete: true
            },
            {
                optionName: 'reason',
                type: 'STRING',
                required: false
            }
        ]
    }
};
