exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {

    //-kick (@usuario | id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

        let notToKickEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID`);

        let noReasonEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes proporcionar un motivo`);

        if (!args[0]) return message.channel.send(notToKickEmbed);

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let member;
        try {
            member = await message.guild.members.fetch(message.mentions.users.first() || args[0]);
        } catch (e) {
            return message.channel.send(notToKickEmbed);
        }
        
        let moderator = await message.guild.members.fetch(message.author);
        
        //Se comprueba si puede banear al usuario
        if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed)

        let toDeleteCount = command.length - 2 + args[0].length + 2;

        //Esto comprueba si se debe proporcionar razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason && message.author.id !== message.guild.ownerID) return message.channel.send(noReasonEmbed);
        if (!reason) reason = `Indefinida`;

        let successEmbed = new discord.MessageEmbed ()
            .setColor(resources.green)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription(`El usuario <@${member.id}> ha sido expulsado, ¿alguien más?`);

        let toDMEmbed = new discord.MessageEmbed ()
            .setColor(resources.red2)
            .setAuthor(`[EXPULSADO]`, message.guild.iconURL())
            .setDescription(`<@${member.id}>, has sido expulsado en ${message.guild.name}`)
            .addField(`Moderador`, message.author.tag, true)
            .addField(`Razón`, reason, true)

        await member.send(toDMEmbed);
        await member.kick(reason);
        await message.channel.send(successEmbed);
    } catch (e) {
        require('../../errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
