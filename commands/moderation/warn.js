exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
        
        let notToWarnEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No puedes advertir a un bot`);
        
        let undefinedReasonEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Se debe adjuntar una razón`);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await client.functions.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send({ embeds: [notToWarnEmbed] });
        if (member.user.bot) return message.channel.send({ embeds: [noBotsEmbed] });

        //Esto comprueba si se ha aportado alguna razón
        let reason = args.slice(1).join(' ');
        if (!reason) return message.channel.send({ embeds: [undefinedReasonEmbed] });
          
        let moderator = await client.functions.fetchMember(message.guild, message.author.id);
        
        //Se comprueba si puede advertir al miembro
        if (moderator.id !== message.guild.ownerId) {
            if (moderator.roles.highest.position <= member.roles.highest.position) {

                let cannotWarnHigherRoleEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} No puedes advertir a un miembro con un rol igual o superior al tuyo`);
    
                return message.channel.send({ embeds: [cannotWarnHigherRoleEmbed] });
            };
        };

        //Llama al manejador de infracciones
        require('../../utils/infractionsHandler.js').run(client, message, member, reason, 2, message.author);

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
