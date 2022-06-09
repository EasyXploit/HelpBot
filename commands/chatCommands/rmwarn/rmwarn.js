exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(interaction.options._hoistedOptions[0].value);

        //Almacena el ID del miembro
        const memberId = member ? member.id : interaction.options._hoistedOptions[0].value;

        //Devuelve un error si se ha proporcionado un bot
        if (member && member.user.bot) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});
        
        //Comprueba si se ha aportado alguna advertencia
        const warnId = interaction.options._hoistedOptions[1].value;

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

        //Función para comprobar si el miembro puede borrar cualquier advertencia
        function checkIfCanRemoveAny() {

            //Almacena si el miembro puede borrar cualquiera
            let authorized;

            //Para cada ID de rol de la lista blanca
            for (let index = 0; index < commandConfig.removeAny.length; index++) {

                //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                if (interaction.member.id === interaction.guild.ownerId || interaction.member.roles.cache.find(role => role.id === client.config.main.botManagerRole) || interaction.member.roles.cache.find(role => role.id === commandConfig.removeAny[index])) {
                    authorized = true;
                    break;
                };
            };

            //Devuelve el estado de autorización
            return authorized;
        };

        //Crear variables para almacenar los embeds a enviar
        let successEmbed, loggingEmbed, toDMEmbed;

        //Si hay que eliminar todas las infracciones
        if (warnId === 'all') {

            //Comprueba si el miembro puede eliminar cualquier advertencia
            if (!checkIfCanRemoveAny()) return interaction.reply({ embeds: [ new client.MessageEmbed()
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

            //Si se encontró al miembro, añade su tag al registro
            member ? loggingEmbed.addField(locale.loggingEmbedAll.member, member.user.tag, true) : null;

            //Genera una notificación para el miembro
            if (member) toDMEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor({ name: locale.privateEmbedAll.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(client.functions.localeParser(locale.privateEmbedAll.description, { member: member }))
                .addField(locale.privateEmbedAll.moderator, interaction.user.tag, true)
                .addField(locale.privateEmbedAll.reason, reason || locale.undefinedReason, true);

            //Genera una notificación de la acción para el canal de invocación
            successEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbedAll.title}`)
                .setDescription(client.functions.localeParser(locale.notificationEmbedAll.description, { member: member ? member.user.tag : `${memberId} (ID)` }));

            //Elimina la entrada de la base de datos
            delete client.db.warns[memberId];

        } else { //Si solo hay que eliminar una infracción

            //Comprueba si la advertencia existe en la BD
            if (!client.db.warns[memberId][warnId]) return interaction.reply({ embeds: [new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.warnNotFound, { warnId: warnId })}`)
            ], ephemeral: true});

            //Comprueba si puede borrar esta advertencia
            if (client.db.warns[memberId][warnId].moderator !== interaction.member.id && !checkIfCanRemoveAny()) return interaction.reply({ embeds: [ new client.MessageEmbed()
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

            //Si se encontró al miembro, añade su tag al registro
            member ? loggingEmbed.addField(locale.loggingEmbedSingle.member, member.user.tag, true) : null;

            //Genera una notificación para el miembro
            if (member) toDMEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor({ name: locale.privateEmbedSingle.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(client.functions.localeParser(locale.privateEmbedSingle.description, { member: member, warnId: warnId }))
                .addField(locale.privateEmbedSingle.moderator, interaction.user.tag, true)
                .addField(locale.privateEmbedSingle.warnId, warnId, true)
                .addField(locale.privateEmbedSingle.warn, client.db.warns[memberId][warnId].reason, true)
                .addField(locale.privateEmbedSingle.reason, reason || locale.undefinedReason, true);

            //Genera una notificación de la acción para el canal de invocación
            successEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbedSingle.title}`)
                .setDescription(client.functions.localeParser(locale.notificationEmbedSingle.description, { warnId: warnId, member: member ? member.user.tag : `${memberId} (ID)` }));

            //Resta el warn indicado
            delete client.db.warns[memberId][warnId];
            
            //Si se queda en 0 warns, se borra la entrada del JSON
            if (Object.keys(client.db.warns[memberId]).length === 0) delete client.db.warns[memberId];
        };

        //Escribe el resultado en el JSON
        client.fs.writeFile('./databases/warns.json', JSON.stringify(client.db.warns, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Envía un registro al canal de registros
            await client.functions.loggingManager('embed', loggingEmbed);

            //Envía un mensaje de confirmación al miembro
            if (member) await member.send({ embeds: [toDMEmbed] });

            //Envía una notificación de la acción en el canal de invocación
            await interaction.reply({ embeds: [successEmbed] });
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
                optionName: 'id',
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
