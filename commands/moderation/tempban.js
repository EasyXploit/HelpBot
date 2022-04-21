exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {
        
        //Devuelve un error si no se ha proporcionado un usuario objetivo
        if (!args[0] || !args[1]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Busca al usuario proporcionado
        const user = await client.functions.fetchUser(args[0]);

        //Devuelve un error si no se ha encontrado al usuario
        if (!user) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.userNotFound}.`)
        ]});

        //Si el usuario era un bot
        if (user.bot) {

            //Almacena si el miembro puede banear bots
            let authorized;

            //Por cada uno de los roles que pueden banear bots
            for (let index = 0; index < commandConfig.botsAllowed; index++) {

                //Comprueba si el miembro ejecutor lo tiene
                if (message.member.roles.cache.has(commandConfig.botsAllowed[index])) {
                    authorized = true;
                    break;
                };
            };

            //Si no está autorizado para ello, devuelve un mensaje de error
            if (!authorized) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });
        };

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(message.guild, user.id);

        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (member && message.author.id !== message.guild.ownerId && message.member.roles.highest.position <= member.roles.highest.position) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ]});
        
        //Se comprueba si el usuario ya estaba baneado
        const guildBans = await message.guild.bans.fetch();

        //Comprueba si el usuario ya estaba baneado
        for (const bans of guildBans) {

            //Si el usuario ya estaba baneado, devuelve un error
            if (bans[0] === user.id) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyBanned}.`)
            ]});
        };

        //Comprueba la longitud del tiempo proporcionado
        if (!args[1] || args[1].length < 2) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Calcula el tiempo estimado en milisegundos
        const milliseconds = await client.functions.magnitudesToMs(args[1]);

        //Comprueba si se ha proporcionado un tiempo válido
        if (!milliseconds) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Almacena si el miembro puede banear
        let authorized;

        //Para cada ID de rol de la lista blanca
        for (let index = 0; index < commandConfig.unlimitedTime.length; index++) {

            //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
            if (message.author.id === message.guild.ownerId || message.member.roles.cache.find(role => role.id === client.config.main.botManagerRole) || message.member.roles.cache.find(role => role.id === commandConfig.unlimitedTime[index])) {
                authorized = true;
                break;
            };
        };

        //Si no se permitió la ejecución, manda un mensaje de error
        if (!authorized && milliseconds > commandConfig.maxRegularTime) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.exceededDuration, { time: client.functions.msToHHMMSS(commandConfig.maxRegularTime) })}.`)
        ]});
        
        //Almacena la razón
        let reason = args.splice(2).join(' ');

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
        
        //Registra el baneo en la base de datos
        client.db.bans[user.id] = {
            until: Date.now() + milliseconds
        };

        //Sobreescribe el fichero de la base de datos con los cambios
        client.fs.writeFile('./databases/bans.json', JSON.stringify(client.db.bans, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Si no hay caché de registros
            if (!client.loggingCache) client.loggingCache = {};

            //Crea una nueva entrada en la caché de registros
            client.loggingCache[user.id] = {
                action: 'tempban',
                executor: message.author.id,
                reason: reason || locale.undefinedReason,
                expiration: Date.now() + milliseconds
            };

            //Envía una notificación al miembro
            if (member) await user.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: message.guild.iconURL({ dynamic: true}) })
                .setDescription(client.functions.localeParser(locale.privateEmbed.description, { user: user, guildName: message.guild.name }))
                .addField(locale.privateEmbed.moderator, message.author.tag, true)
                .addField(locale.privateEmbed.reason, reason || locale.undefinedReason, true)
                .addField(locale.privateEmbed.expiration, `<t:${Math.round(new Date(parseInt(Date.now() + milliseconds)) / 1000)}:R>`, true)
            ]});

            //Banea al miembro
            await message.guild.members.ban(user, { reason: reason || locale.undefinedReason });

            //Genera una descripción para el embed de notificación
            const notificationEmbedDescription = reason ? client.functions.localeParser(locale.notificationEmbed.withReason, { userTag: user.tag, reason: reason }) : client.functions.localeParser(locale.notificationEmbed.withoutReason, { userTag: user.tag })

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
    name: 'tempban',
    aliases: []
};
