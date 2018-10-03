exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(resources.GrayTick + ' **Función experimental**\nEstás ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed).then(msg => {msg.delete(5000)});
    
    //-expulsar (@usuario | id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

        let notToKickEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes mencionar a un miembro o escribir su id');

        let noReasonEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes proporcionar un motivo');

        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' No puedes expulsar a un bot');

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let member = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if (!member) return message.channel.send(notToKickEmbed);
        
        let author = message.guild.member(message.author.id)
        
        //Se comprueba si puede banear al usuario
        if (author.id !== message.guild.owner.id) {
            if (author.highestRole.position <= member.highestRole.position) return message.channel.send(noPrivilegesEmbed)
        }

        let toDeleteCount = command.length - 2 + args[0].length + 2;

        //Esto comprueba si se ha proporcionado razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason) return message.channel.send(noReasonEmbed);

        if (member.bot) return message.channel.send('noBotsEmbed');

        let successEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(resources.GreenTick + ' Operación completada')
            .setDescription('El usuario <@' + member.id + '> ha sido expulsado, ¿alguien más?');

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor(member.user.tag + ' ha sido EXPULSADO', member.user.displayAvatarURL)
            .addField('Miembro', '<@' + member.id + '>', true)
            .addField('Moderador', '<@' + message.author.id + '>', true)
            .addField('Razón', reason, true)

        let toDMEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor('[EXPULSADO]', message.guild.iconURL)
            .setDescription('<@' + member.id + '>, has sido expulsado en ' + message.guild.name)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)

        await member.send(toDMEmbed);
        await member.kick(reason);
        await loggingChannel.send(loggingEmbed);
        await message.channel.send(successEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
