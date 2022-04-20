exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {

        //Devuelve un error si no se ha proporcionado un miembro objetivo
        if (!args[0]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(message.guild, args[0]);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ]});

        //Si el miembro era un bot
        if (member.user.bot) {

            //Almacena si el miembro puede silenciar bots
            let authorized;

            //Por cada uno de los roles que pueden silenciar bots
            for (let index = 0; index < commandConfig.botsAllowed; index++) {

                //Comprueba si el miembro ejecutor lo tiene
                if (message.member.roles.cache.has(commandConfig.botsAllowed[index])) {
                    authorized = true;
                    break;
                };
            };

            //Si no está autorizado para ello, devuelve un mensaje de error
            if (!authorized) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });
        };
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (message.author.id !== message.guild.ownerId && message.member.roles.highest.position <= member.roles.highest.position) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ]});

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await client.functions.checkMutedRole(message.guild);

        //Comprueba si el miembro ya tenía el rol silenciado
        if (member.roles.cache.has(mutedRole.id)) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.alreadySilenced}.`)
        ]});

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
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}.`)
            ]});
        };

        //Guarda el silenciamiento en la base de datos
        client.db.mutes[member.id] = {
            until: null,
            moderator: message.author.id
        };

        //Sobreescribe el fichero de la base de datos con los cambios
        client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Añade el rol silenciado al miembro
            member.roles.add(mutedRole);

            //Propaga el rol silenciado
            client.functions.spreadMutedRole(message.guild);

            //Envía un mensaje al canal de registros
            await client.functions.loggingManager('embed', new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: client.functions.localeParser(locale.loggingEmbed.author, { memberTag: member.user.tag }), iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .addField(locale.loggingEmbed.memberId, member.id, true)
                .addField(locale.loggingEmbed.moderator, message.author.tag, true)
                .addField(locale.loggingEmbed.reason, reason || locale.undefinedReason, true)
                .addField(locale.loggingEmbed.expiration, locale.loggingEmbed.noExpiration, true)
            );

            //Envía una notificación al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: message.guild.iconURL({ dynamic: true}) })
                .setDescription(client.functions.localeParser(locale.privateEmbed.description, { member: member, guildName: message.guild.name }))
                .addField(locale.privateEmbed.moderator, message.author.tag, true)
                .addField(locale.privateEmbed.reason, reason || locale.undefinedReason, true)
                .addField(locale.privateEmbed.expiration, locale.privateEmbed.noExpiration, true)
            ]});

            //Genera una descripción para el embed de notificación
            const notificationEmbedDescription = reason ? client.functions.localeParser(locale.notificationEmbed.withReason, { memberTag: member.user.tag, reason: reason }) : client.functions.localeParser(locale.notificationEmbed.withoutReason, { memberTag: member.user.tag })

            //Notifica la acción en el canal de invocación
            await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
            ]});
        });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'mute',
    aliases: []
};
