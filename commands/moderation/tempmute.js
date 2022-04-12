exports.run = async (client, message, args, command, commandConfig) => {
    
    try {

        //Devuelve un error si no se ha proporcionado un miembro objetivo
        if (!args[0] || !args[1]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(message.guild, args[0]);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID`)
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
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} No puedes banear a un bot`)
            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });
        };
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (message.member.id !== message.guild.ownerId && message.member.roles.highest.position <= member.roles.highest.position) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No puedes silenciar a un miembro con un rol igual o superior al tuyo`)
        ]});

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await client.functions.checkMutedRole(message.guild);

        //Comprueba si el miembro ya tenía el rol silenciado
        if (member.roles.cache.has(mutedRole.id)) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Este miembro ya esta silenciado`)
        ]});
        
        //Comprueba la longitud del tiempo proporcionado
        if (args[1].length < 2) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Calcula el tiempo estimado en milisegundos
        const milliseconds = await client.functions.magnitudesToMs(args[1]);

        //Comprueba si se ha proporcionado un tiempo válido
        if (!milliseconds) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Almacena si el miembro puede silenciar
        let authorized;

        //Para cada ID de rol de la lista blanca
        for (let index = 0; index < commandConfig.unlimitedTime.length; index++) {

            //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
            if (message.author.id === message.guild.ownerId || message.author.id === client.config.main.botManagerRole || message.member.roles.cache.find(role => role.id === commandConfig.unlimitedTime[index])) {
                authorized = true;
                break;
            };
        };

        //Si no se permitió la ejecución, manda un mensaje de error
        if (!authorized && milliseconds > commandConfig.maxRegularTime) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Solo puedes silenciar un máximo de \`${client.functions.msToHHMMSS(commandConfig.maxRegularTime)}\`.`)
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
                .setDescription(`${client.customEmojis.redTick} Debes proporcionar una razón`)
            ]});
        };

        //Guarda el silenciamiento en la base de datos
        client.db.mutes[member.id] = {
            until: Date.now() + milliseconds,
            moderator: message.author.id
        };

        //Sobreescribe el fichero de la base de datos con los cambios
        client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Silencia al miembro
            member.roles.add(mutedRole);

            //Propaga el rol silenciado
            client.functions.spreadMutedRole(message.guild);

            //Envía un mensaje al canal de registros
            await client.functions.loggingManager('embed', new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: `${member.user.tag} ha sido SILENCIADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .addField('Miembro', member.user.tag, true)
                .addField('Moderador', message.author.tag, true)
                .addField('Razón', reason || 'Indefinida', true)
                .addField('Duración', args[1], true)
            );

            //Envía una notificación al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: '[SILENCIADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
                .setDescription(`${member}, has sido silenciado en ${message.guild.name}`)
                .addField('Moderador', message.author.tag, true)
                .addField('Razón', reason || 'Indefinida', true)
                .addField('Vencimiento', `<t:${Date.now() + milliseconds}:R>`, true)
            ]});

            //Notifica la acción en el canal de invocación
            await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido silenciado${ reason ? ` debido a **${reason}**` : ''}, ¿alguien más?`)
            ]});
        });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'tempmute',
    description: 'Silencia temporalmente a un miembro de los canales de texto y voz.',
    aliases: [],
    parameters: '<@miembro| id> <días"S" | minutos"M" | horas"H" | días"D"> [razón]'
};
