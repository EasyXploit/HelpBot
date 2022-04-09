exports.run = async (client, message, args, command, commandConfig) => {
    
    try {

        //Devuelve un error si no se ha proporcionado un miembro objetivo
        if (!args[0]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(message.guild, args[0]);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID`)
        ]});

        //Si el miembro era un bot
        if (member.user.bot) {

            //Almacena si el miembro puede expulsar bots
            let authorized;

            //Por cada uno de los roles que pueden expulsar bots
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
        if (message.author.id !== message.guild.ownerId && message.member.roles.highest.position <= member.roles.highest.position) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No puedes expulsar a un miembro con un rol igual o superior al tuyo`)
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
        
        //Envía una notificación al miembro
        await member.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: '[EXPULSADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
            .setDescription(`<@${member.id}>, has sido expulsado de ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason || 'Indefinida', true)
        ]});

        //Expulsa al miembro
        await member.kick(`Moderador: ${message.author.id}, Razón: ${reason || 'Indefinida'}`);

        //Notifica la acción en el canal de invocación
        await message.channel.send({embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido expulsado${ reason ? ` debido a **${reason}**` : ''}, ¿alguien más?`)
        ]});
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'kick',
    description: 'Expulsa a un miembro.',
    aliases: [],
    parameters: '<@miembro| id> [razón]'
};
