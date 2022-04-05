exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
        
        //Devuelve un error si no se ha proporcionado un miembro objetivo
        if (!args[0] || !args[1]) return await client.functions.syntaxHandler(message.channel, commandConfig);
        
        //Busca al usuario proporcionado
        const user = await client.functions.fetchUser(args[0]);

        //Devuelve un error si no se ha encontrado al usuario
        if (!user) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Usuario no encontrado. Debes mencionar a un miembro o escribir su ID.\nSi el usuario no está en el servidor, has de especificar su ID`)
        ]});

        //Si el usuario era un bot
        if (member.user.bot) {

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
                .setDescription(`${client.customEmojis.redTick} No puedes banear a un bot`)
            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });
        };

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(message.guild, user.id);

        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (member && message.author.id !== message.guild.ownerId && message.member.roles.highest.position <= member.roles.highest.position) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No puedes banear a un miembro con un rol igual o superior al tuyo`)
        ]});
        
        //Se comprueba si el usuario ya estaba baneado
        const guildBans = await message.guild.bans.fetch();

        //Comprueba si el usuario ya estaba baneado
        for (const bans of guildBans) {

            //Si el usuario ya estaba baneado, devuelve un error
            if (bans[0] === user.id) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} Este usuario ya ha sido baneado`)
            ]});
        };

        //Calcula los días de mensajes a borrar
        const days = Math.floor(args[1]);

        //Comprueba si la cantidad de días es correcta
        if (isNaN(days) || days < 1 || days > 7) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una cantidad válida de días de mensajes a borrar, entre 1 y 7`)
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

        //Banea al miembro y borra sus mensajes
        await message.guild.members.ban(user, {days: days, reason: `Moderador: ${message.author.id}, Días de mensajes borrados: ${days}, Razón: ${reason || 'Indefinida'}`});

        //Envía una notificación al miembro
        if (member) await user.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: '[BANEADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason || 'Indefinida', true)
            .addField('Días de mensajes borrados', days.toString(), true)
            .addField('Duración', '∞', true)
        ]});

        //Notifica la acción en el canal de invocación
        await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} **${user.tag}** ha sido baneado${ reason ? ` debido a **${reason}**` : ''}, ¿alguien más?`)
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'softban',
    description: 'Banea a un miembro, eliminando X días de mensajes suyos.',
    aliases: [],
    parameters: '<@miembro| id> <días (1-7)> [razón]'
};
