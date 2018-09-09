exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {
    
    let disabledEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ Comando `' + message.content + '` deshabilitado temporalmente');
    message.channel.send(disabledEmbed);
    return;
    
    let errorEmbed = new discord.RichEmbed()
            .setColor(15806281)
            .setDescription('❌ ' + message.author.username + ', no dispones de privilegios suficientes para ejecutar este comando');
    
    let successEmbed = new discord.RichEmbed()
            .setColor(12118406)
            .setTitle('✅ Operación completada')
            .setDescription('Reiniciando PilkoBot . . .');

        let loggingEmbed = new discord.RichEmbed()
            .setColor(4886754)
            .setTimestamp()
            .setFooter(bot.user.username, bot.user.avatarURL)
            .setTitle('📑 Auditoría')
            .setDescription(message.author.username + ' reinició a ' + bot.user.username);
    
    //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
    let toMute = message.mentions.users.first() || message.guild.members.get(args[0]);
    if (!toMute) return message.channel.send('Tienes que mencionar o escribir el ID del usuario a mutear');
    
    
    
    message.channel.send('Mission successful')

        
}
