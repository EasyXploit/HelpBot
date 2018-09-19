exports.run = async (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {
    
    //&dessilenciar (mención/id) (motivo)

    let notToMuteEmbed = new discord.RichEmbed()
        .setColor(0xF12F49)
        .setDescription('❌ Debes mencionar a un miembro o escribir su id');

    //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
    let member = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!member) return message.channel.send(notToMuteEmbed);
    let toDeleteCount = command.length - 2 + args[0].length + 2; 
    let reason = message.content.slice(toDeleteCount) || 'Indefinida'

    let role = message.guild.roles.find(r => r.name === 'Silenciado');

    let alreadyMutedEmbed = new discord.RichEmbed()
        .setColor(0xF12F49)
        .setDescription('❌ Este usuario no esta silenciado');

    let successEmbed = new discord.RichEmbed()
        .setColor(0xB8E986)
        .setTitle('✅ Operación completada')
        .setDescription('El usuario <@' + member.id + '> ha sido des-silenciado');
    
    let loggingEmbed = new discord.RichEmbed()
        .setColor(0x3EB57B)
        .setAuthor(member.user.tag + ' ha sido DES-SILENCIADO', member.user.displayAvatarURL)
        .addField('Miembro', '<@' + member.id + '>', true)
        .addField('Moderador', '<@' + message.author.id + '>', true)
        .addField('Razón', reason, true)
    
    let toDMEmbed = new discord.RichEmbed()
        .setColor(0x3EB57B)
        .setAuthor('[DES-SILENCIADO]', message.guild.iconURL)
        .setDescription('<@' + member.id + '>, has sido des-silenciado en ' + message.guild.name)
        .addField('Moderador', message.author.tag, true)
        .addField('Razón', reason, true)
    
    if (!role || !member.roles.has(role.id)) return message.channel.send(alreadyMutedEmbed)
    
    await member.removeRole(role);
    await message.channel.send(successEmbed);
    await loggingChannel.send(loggingEmbed);
    await member.send(toDMEmbed);
}
