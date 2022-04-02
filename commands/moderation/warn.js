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

        //Devuelve un error si se ha proporcionado un bot
        if (member.user.bot) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No puedes advertir a un bot`)
        ]});
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (message.member.id !== message.guild.ownerId && message.member.roles.highest.position <= member.roles.highest.position) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} No puedes advertir a un miembro con un rol igual o superior al tuyo`)
        ]});

        //Si el miembro tenía advertencias previas y el ejecutor no es el owner de la guild
        if (client.db.warns[member.id] && message.author.id !== message.guild.ownerId) {
            
            //Almacena las claves de cada uno de los warns del miembro
            const warnsKeys = Object.keys(client.db.warns[member.id]);

            //Almacena el último warn del miembro
            const latestWarn = client.db.warns[member.id][warnsKeys[warnsKeys.length - 1]];

            //Si no ha pasado el tiempo mínimo entre advertencias
            if (Date.now() - latestWarn.timestamp < commandConfig.minimumTimeDifference) {

                //Almacena si el miembro puede saltarse el intervalo mínimo
                let authorized;

                //Por cada uno de los roles que pueden saltarse el intervalo mínimo
                for (let index = 0; index < commandConfig.unlimitedFrequency; index++) {

                    //Comprueba si el miembro ejecutor lo tiene
                    if (message.member.roles.cache.has(commandConfig.unlimitedFrequency[index])) {
                        authorized = true;
                        break;
                    };
                };

                //Si no está autorizado, devuelve un mensaje de error
                if (!authorized) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} Tienes que esperar antes de poder poner una nueva advertencia a <@${member.id}>`)
                ]});
            };
        };

        //Esto comprueba si se ha aportado alguna razón
        const reason = args.slice(1).join(' ');

        //Llama al manejador de infracciones
        await require('../../utils/moderation/infractionsHandler.js').run(client, message, member, reason, 2, message.author);

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'warn',
    description: 'Agrega una advertencia a un miembro.',
    aliases: [],
    parameters: '<@miembro| id> <razón>'
};
