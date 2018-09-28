exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis, supervisorsRole, noPrivilegesEmbed) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(emojis.GrayTick + ' **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    message.channel.send(experimentalEmbed);
    
    //-banear (@usuario | id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let notToBanEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' Debes mencionar a un miembro o escribir su id');

        let noReasonEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' Debes proporcionar un motivo');

        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' No puedes banear a un bot');

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let member = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if (!member) return message.channel.send(notToBanEmbed);
        
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
            .setTitle(emojis.GreenTick + ' Operación completada')
            .setDescription('El usuario <@' + member.id + '> ha sido baneado, ¿alguien más?');

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor(member.user.tag + ' ha sido BANEADO', member.user.displayAvatarURL)
            .addField('Miembro', '<@' + member.id + '>', true)
            .addField('Moderador', '<@' + message.author.id + '>', true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);

        let toDMEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor('[BANEADO]', message.guild.iconURL)
            .setDescription('<@' + member.id + '>, has sido baneado en ' + message.guild.name)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);

        await member.send(toDMEmbed);
        await member.ban(7, reason);
        await loggingChannel.send(loggingEmbed);
        await message.channel.send(successEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
