exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Almacena el canal de texto de la interacción
        const interactionChannel = await client.functions.utilities.fetch.run(client, 'channel', interaction.channelId);

        //Almacena los segundos proporcionados
        const argument = interaction.options._hoistedOptions[0].value;

        //Si se debe desactivar el modo lento
        if (argument === 0) {

            //Si el modo lento no estaba activado, envía un error
            if (!interactionChannel.rateLimitPerUser) return await interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${locale.notEnabled}`)
            ], ephemeral: true});

            //Desactiva el modo lento
            await interactionChannel.setRateLimitPerUser(0);

            //Envía un mensaje al canal de registros
            await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle(`📑 ${locale.disabledLoggingEmbed.title}`)
                .setDescription(locale.disabledLoggingEmbed.description)
                .addField(locale.disabledLoggingEmbed.moderator, interaction.user.tag, true)
                .addField(locale.disabledLoggingEmbed.channel, `${interactionChannel}`, true)
            );

            //Notifica la acción en el canal de invocación
            await interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} ${locale.disabledNotificationEmbed.title}`)
                .setDescription(locale.disabledNotificationEmbed.description)
            ], ephemeral: true});

        } else { //Si se debe activar el modo lento

            //Función para comprobar si el miembro puede usar tiempo ilimitado
            function checkIfCanUseUnlimitedTime() {

                //Almacena si el miembro puede usar tiempo ilimitado
                let authorized; 
                
                //Para cada ID de rol de la lista blanca
                for (let index = 0; index < commandConfig.unlimitedTime.length; index++) {

                    //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                    if (interaction.member.id === interaction.guild.ownerId || interaction.member.roles.cache.find(role => role.id === client.config.main.botManagerRole) || interaction.member.roles.cache.find(role => role.id === commandConfig.unlimitedTime[index])) {
                        authorized = true;
                        break;
                    };
                };

                //Devuelve el estado de autorización
                return authorized;
            };

            //Comprueba si los segundos excedieron el máximo configurado
            if (!checkIfCanUseUnlimitedTime() && argument > commandConfig.maxRegularSeconds) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.privateEmbedSingle.description, { max: commandConfig.maxRegularSeconds })}`)
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
                    .setDescription(`${client.customEmojis.redTick} ${locale.noReason}`)
                ], ephemeral: true});
            };

            //Activa el modo lento en el canal
            await interactionChannel.setRateLimitPerUser(argument, reason || locale.undefinedReason);

            //Envía un mensaje al canal de registros
            await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle(`📑 ${locale.enabledLoggingEmbed.title}`)
                .setDescription(locale.enabledLoggingEmbed.description)
                .addField(locale.enabledLoggingEmbed.moderator, interaction.user.tag, true)
                .addField(locale.enabledLoggingEmbed.delay, await client.functions.utilities.parseLocale.run(locale.enabledLoggingEmbed.delayed, { seconds: argument }), true)
                .addField(locale.enabledLoggingEmbed.channel, `${interactionChannel}`, true)
                .addField(locale.enabledLoggingEmbed.reason, reason || locale.undefinedReason, true)
            );

            //Notifica la acción en el canal de invocación
            await interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} ${locale.enabledNotificationEmbed.title}`)
                .setDescription(await client.functions.utilities.parseLocale.run(locale.enabledNotificationEmbed.description, { seconds: argument }))
            ], ephemeral: true});
        };
        
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
                optionName: 'seconds',
                type: 'INTEGER',
                minValue: 0,
                maxValue: 21600,
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
