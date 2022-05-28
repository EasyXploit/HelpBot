exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {

        //Devuelve un error si no se ha proporcionado un miembro objetivo
        if (!args[0]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Busca al usuario proporcionado
        const user = await client.functions.fetchUser(args[0]);

        //Devuelve un error si no se ha encontrado al usuario
        if (!user) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.userNotFound}.`)
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

        //Se comprueba si el usuario ya estaba baneado
        const guildBans = await message.guild.bans.fetch();

        //Almacena el estado de baneo del usuario
        let banned = false;

        //Por cada uno de los baneos de la guild
        for (const bans of guildBans) {

            //Comprueba si el ID del usuario coincide con el del baneo
            if (bans[0] === user.id) banned = true
        };

        //Si el usuario no estaba baneado, devuelve un error
        if (!banned) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.notBanned}.`)
        ]});

        //Desbanea al miembro
        await message.guild.members.unban(user.id);
        
        //Si el baneo estaba registrado en la base de datos
        if (client.db.bans.hasOwnProperty(user.id)) {

            //Elimina la entrada de la base de datos
            delete client.db.bans[user.id];

            //Sobreescribe el fichero de la base de datos con los cambios
            await client.fs.writeFile('./databases/bans.json', JSON.stringify(client.db.bans), async err => {

                //Si hubo un error, lo lanza a la consola
                if (err) throw err;
            });
        };

        //Envía un mensaje al canal de registros
        await client.functions.loggingManager('embed', new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setAuthor({ name: client.functions.localeParser(locale.loggingEmbed.author, { userTag: user.tag }), iconURL: user.displayAvatarURL({dynamic: true}) })
            .addField(locale.loggingEmbed.userId, user.id.toString(), true)
            .addField(locale.loggingEmbed.moderator, message.author.tag, true)
            .addField(locale.loggingEmbed.reason, reason || locale.undefinedReason, true)
        );

        //Notifica la acción en el canal de invocación
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryCorrect)
            .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbed.title}`)
            .setDescription(client.functions.localeParser(locale.loggingEmbed.author, { userTag: user.tag }))
        ]});
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'unban',
    aliases: []
};
