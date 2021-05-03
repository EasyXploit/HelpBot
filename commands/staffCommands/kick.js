exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {

    //-kick (@usuario | id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

        let notToKickEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID`);

        let noReasonEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes proporcionar un motivo`);

        if (!args[0]) return message.channel.send(notToKickEmbed);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await resources.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send(notToKickEmbed);
        let moderator = await resources.fetchMember(message.guild, message.author.id);
        
        //Se comprueba si puede expulsar al miembro
        if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed)

        let toDeleteCount = command.length - 2 + args[0].length + 2;

        //Esto comprueba si se debe proporcionar razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason && message.author.id !== message.guild.ownerID) return message.channel.send(noReasonEmbed);
        if (!reason) reason = 'Indefinida';

        let successEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription(`El miembro **${member.user.tag}** ha sido expulsado, ¿alguien más?`);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setAuthor(`[EXPULSADO]`, message.guild.iconURL())
            .setDescription(`<@${member.id}>, has sido expulsado de ${message.guild.name}`)
            .addField(`Moderador`, message.author.tag, true)
            .addField(`Razón`, reason, true)

        await message.delete();
        await member.send(toDMEmbed);
        await member.kick(`Moderador: ${message.author.id}, Razón: ${reason}`);
        await message.channel.send(successEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
