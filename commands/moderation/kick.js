exports.run = async (discord, client, message, args, command, commandConfig) => {

    //!kick (@usuario | id) (motivo)
    
    try {
        let notToKickEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID`);

        let noReasonEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar un motivo`);

        if (!args[0]) return message.channel.send(notToKickEmbed);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await client.functions.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send(notToKickEmbed);
        let moderator = await client.functions.fetchMember(message.guild, message.author.id);
        
        //Se comprueba si puede expulsar al miembro
        if (moderator.roles.highest.position <= member.roles.highest.position) {

            let cannotKickHigherRoleEmbed = new discord.MessageEmbed()
                .setColor(client.colors.red)
                .setDescription(`${client.customEmojis.redTick} No puedes expulsar a un miembro con un rol igual o superior al tuyo`);

            return message.channel.send(cannotKickHigherRoleEmbed);
        };

        //Genera un mensaje de confirmación
        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.orange)
            .setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido expulsado, ¿alguien más?`);

        //Almacena la razón
        let toDeleteCount = command.length - 2 + args[0].length + 2;
        let reason = message.content.slice(toDeleteCount)

        //Si se ha proporcionado razón, la adjunta al mensaje de confirmación
        if (reason) successEmbed.setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido expulsado debido a **${reason}**, ¿alguien más?`);

        //Esto comprueba si se debe proporcionar razón
        if (!reason && message.author.id !== message.guild.ownerID) return message.channel.send(noReasonEmbed);
        if (!reason) reason = 'Indefinida';

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setAuthor(`[EXPULSADO]`, message.guild.iconURL({ dynamic: true}))
            .setDescription(`<@${member.id}>, has sido expulsado de ${message.guild.name}`)
            .addField(`Moderador`, message.author.tag, true)
            .addField(`Razón`, reason, true)
            
        await member.send(toDMEmbed);
        await member.kick(`Moderador: ${message.author.id}, Razón: ${reason}`);
        await message.channel.send(successEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'kick',
    aliases: []
};
