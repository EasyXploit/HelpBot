exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(resources.GrayTick + ' **Función experimental**\nEstás ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    await message.channel.send(experimentalEmbed).then(msg => {msg.delete(5000)});
    
    //-silenciar (@usuario | id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

        let notToMuteEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes mencionar a un miembro o escribir su id');

        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' No puedes silenciar a un bot');

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let member = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if (!member) return message.channel.send(notToMuteEmbed);
        let toDeleteCount = command.length - 2 + args[0].length + 2; 
        let reason = message.content.slice(toDeleteCount) || 'Indefinida';

        if (member.bot) return message.channel.send('noBotsEmbed');

        let role = message.guild.roles.find(r => r.name === 'Silenciado');

        let alreadyMutedEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Este usuario no esta silenciado');

        let successEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(resources.GreenTick + ' Operación completada')
            .setDescription('El usuario <@' + member.id + '> ha sido des-silenciado');

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0x3EB57B)
            .setAuthor(member.user.tag + ' ha sido DES-SILENCIADO', member.user.displayAvatarURL)
            .addField('Miembro', '<@' + member.id + '>', true)
            .addField('Moderador', '<@' + message.author.id + '>', true)
            .addField('Razón', reason, true);

        let toDMEmbed = new discord.RichEmbed()
            .setColor(0x3EB57B)
            .setAuthor('[DES-SILENCIADO]', message.guild.iconURL)
            .setDescription('<@' + member.id + '>, has sido des-silenciado en ' + message.guild.name)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true);

        if (!role || !member.roles.has(role.id)) return message.channel.send(alreadyMutedEmbed);

        await member.removeRole(role);
        await message.channel.send(successEmbed);
        await loggingChannel.send(loggingEmbed);
        await member.send(toDMEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
