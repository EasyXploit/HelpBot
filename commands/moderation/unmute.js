exports.run = async (client, message, args, command, commandConfig) => {
    
    try {

        //Devuelve un error si no se ha proporcionado un miembro objetivo
        if (!args[0]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(message.guild, args[0]);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID`)
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
                .setDescription(`${client.customEmojis.redTick} Debes proporcionar una razón`)
            ]});
        };

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await client.functions.checkMutedRole(message.guild);

        //Comprueba si el miembro no estaba silenciado
        if (!member.roles.cache.has(mutedRole.id)) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Este miembro no esta silenciado`)
        ]});

        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (message.member.id !== message.guild.ownerId && message.member.roles.highest.position <= member.roles.highest.position) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`)
        ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });

        //Elimina el rol silenciado al miembro
        await member.roles.remove(mutedRole);
        
        //Si el silenciamiento estaba registrado en la base de datos
        if (client.db.mutes.hasOwnProperty(member.id)) {

            //Elimina la entrada de la base de datos
            delete client.db.mutes[member.id];

            //Sobreescribe el fichero de la base de datos con los cambios
            await client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.db.mutes), async err => {

                //Si hubo un error, lo lanza a la consola
                if (err) throw err;
            });
        };

        //Envía un mensaje al canal de registros
        await client.functions.loggingManager('embed', new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setAuthor({ name: `${member.user.tag} ha sido DES-SILENCIADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason || 'Indefinida', true)
        );

        //Envía una notificación al miembro
        await member.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setAuthor({ name: '[DES-SILENCIADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
            .setDescription(`${member}, has sido des-silenciado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason || 'Indefinida', true)
        ]});

        //Notifica la acción en el canal de invocación
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryCorrect)
            .setTitle(`${client.customEmojis.greenTick} Operación completada`)
            .setDescription(`El miembro **${member.user.tag}** ha sido des-silenciado`)
        ]});
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'unmute',
    description: 'Dessilencia a un miembro.',
    aliases: [],
    parameters: '<@miembro| id> [razón]'
};
