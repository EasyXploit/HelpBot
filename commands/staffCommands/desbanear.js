exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis, supervisorsRole, noPrivilegesEmbed) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(emojis.GrayTick + ' **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    message.channel.send(experimentalEmbed);
    
    //-desbanear (id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

        let notToUnbanEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' Debes mencionar a un miembro o escribir su id');

        let noReasonEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' Debes proporcionar un motivo');

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let user = args[0];
        if (!user) return message.channel.send(notToUnbanEmbed);

        let toDeleteCount = command.length - 2 + args[0].length + 2;

        //Esto comprueba si se ha proporcionado razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason) return message.channel.send(noReasonEmbed);

        await message.guild.unban(user.id);

        let successEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(emojis.GreenTick + ' Operación completada')
            .setDescription('El usuario ' + user.tag + ' ha sido desbaneado');

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0x3EB57B)
            .setAuthor(user.tag + ' ha sido DESBANEADO', user.displayAvatarURL)
            .addField('Miembro', '<@' + user + '>', true)
            .addField('Moderador', '<@' + message.author.id + '>', true)
            .addField('Razón', reason, true)

        let toDMEmbed = new discord.RichEmbed()
            .setColor(0x3EB57B)
            .setAuthor('[DESBANEADO]', message.guild.iconURL)
            .setDescription('<@' + user + '>, has sido desbaneado en ' + message.guild.name)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)

        await loggingChannel.send(loggingEmbed);
        await user.send(toDMEmbed);
        await message.channel.send(successEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
