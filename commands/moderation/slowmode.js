exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {

        //Devuelve un error si no se ha proporcionado una cantidad de tiempo
        if (!args[0]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Si se debe desactivar el modo lento
        if (args[0] === 'off') {

            //Si el modo lento no estaba activado, envía un error
            if (!message.channel.rateLimitPerUser) return await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${locale.notEnabled}`)
            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });

            //Desactiva el modo lento
            await message.channel.setRateLimitPerUser(0);

            //Envía un mensaje al canal de registros
            await client.functions.loggingManager('embed', new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle(`📑 ${locale.disbledLoggingEmbed.title}`)
                .setDescription(locale.disbledLoggingEmbed.description)
                .addField(locale.disbledLoggingEmbed.moderator, message.author.tag, true)
                .addField(locale.disbledLoggingEmbed.channel, `${message.channel}`, true)
            );

            //Notifica la acción en el canal de invocación
            await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} ${locale.disbledNotificationEmbed.title}`)
                .setDescription(locale.disbledNotificationEmbed.description)
            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });

        } else { //Si se debe activar el modo lento

            //Comprueba si se ha proporcionado una cantidad válida de segundos
            if (isNaN(args[0]) || args[0] < 1) return await client.functions.syntaxHandler(message.channel, commandConfig);

            //Función para comprobar si el miembro puede usar tiempo ilimitado
            function checkIfCanUseUnlimitedTime() {

                //Almacena si el miembro puede usar tiempo ilimitado
                let authorized; 
                
                //Para cada ID de rol de la lista blanca
                for (let index = 0; index < commandConfig.unlimitedTime.length; index++) {

                    //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                    if (message.author.id === message.guild.ownerId || message.member.roles.cache.find(role => role.id === client.config.main.botManagerRole) || message.member.roles.cache.find(role => role.id === commandConfig.unlimitedTime[index])) {
                        authorized = true;
                        break;
                    };
                };

                //Devuelve el estado de autorización
                return authorized;
            };

            //Comprueba si los segundos excedieron el límite de la API
            if (args[0] > 21600) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${locale.maximumDefaultLengthError}`)
            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });

            //Comprueba si los segundos excedieron el máximo configurado
            if (!checkIfCanUseUnlimitedTime() && args[0] > commandConfig.maxRegularSeconds) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.privateEmbedSingle.description, { max: commandConfig.maxRegularSeconds })}`)
            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });

            //Almacena la razón
            let reason = args.splice(1).join(' ');

            //Capitaliza la razón
            if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

            //Si no se ha proporcionado razón y el miembro no es el dueño
            if (!reason && message.author.id !== message.guild.ownerId) {

                //Almacena si el miembro puede omitir la razón
                let authorized;

                //Por cada uno de los roles que pueden omitir la razón
                for (let index = 0; index < commandConfig.reasonNotNeeded; index++) {

                    //Comprueba si el miembro ejecutor lo tiene
                    if (message.member.roles.cache.has(commandConfig.reasonNotNeeded[index])) {
                        authorized = true;
                        break;
                    };
                };

                //Si no está autorizado, devuelve un mensaje de error
                if (!authorized) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.noReason}`)
                ]});
            };

            //Activa el modo lento en el canal
            await message.channel.setRateLimitPerUser(args[0], reason || locale.undefinedReason);

            //Envía un mensaje al canal de registros
            await client.functions.loggingManager('embed', new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle(`📑 ${locale.enabledLoggingEmbed.title}`)
                .setDescription(locale.enabledLoggingEmbed.description)
                .addField(locale.enabledLoggingEmbed.moderator, message.author.tag, true)
                .addField(locale.enabledLoggingEmbed.delay, client.functions.localeParser(locale.enabledLoggingEmbed.delayed, { seconds: args[0] }), true)
                .addField(locale.enabledLoggingEmbed.channel, `${message.channel}`, true)
                .addField(locale.enabledLoggingEmbed.reason, reason || locale.undefinedReason, true)
            );

            //Notifica la acción en el canal de invocación
            await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} ${locale.enabledNotificationEmbed.title}`)
                .setDescription(client.functions.localeParser(locale.enabledNotificationEmbed.description, { seconds: args[0] }))
            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });
        };
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'slowmode',
    aliases: ['slow']
};
