exports.run = (discord, fs, config, token, bot, message, args, command, roles, loggingChannel) => {
    
    try {
        let noMentionEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ No has mencionado un usuario válido');
        
        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ No puedes obtener información de un bot');
        
        let toInfo = message.mentions.users.first();
        //let guild = bot.guilds.get(message.guild.id);
        let member = message.guild.members.get(message.mentions.users.first().id)
        if (!toInfo) return message.channel.send(noMentionEmbed);
        if (toInfo.bot) return message.channel.send(noBotsEmbed);
        
        let resultEmbed = new discord.RichEmbed()
            .setColor(member.displayHexColor)
            .setTitle('🙍 Información de usuario')
            .setDescription('Mostrando información acerca del usuario <@' + toInfo.id + '>')
            .setThumbnail(toInfo.displayAvatarURL)
            .addField('Nickname', member.displayName, true)
            .addField('TAG completo', toInfo.tag, true)
            .addField('ID del usuario', toInfo.id, true)
            .addField('Baneable', member.bannable, true)
            .addField('Fecha de registro', toInfo.createdAt.toUTCString() + ' (Timestamp: ' + toInfo.createdTimestamp + ')', true)
            .addField('Unido al servidor', member.joinedAt.toUTCString() + ' (Timestamp: ' + member.joinedTimestamp + ')', true)
            //.addField('Permisos', member.permissions.toString(), true)
            //.addField('Roles', member.roles.highestRole, true)
            .addField('Último mensaje', toInfo.lastMessage + ' (ID: ' + toInfo.lastMessageID + ')', true)
        message.channel.send(resultEmbed);
        
    } catch (e) {
        console.error(new Date().toUTCString() + ' 》' + e);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle('❌ Ocurrió un error')
            .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
        message.channel.send(errorEmbed);
    }
}
