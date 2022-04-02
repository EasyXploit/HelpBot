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

        //Esto comprueba si se ha aportado alguna razón
        const reason = args.slice(1).join(' ');

        //Llama al manejador de infracciones
        require('../../utils/lifecycle/infractionsHandler.js').run(client, message, member, reason, 2, message.author);

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
