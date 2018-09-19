exports.run = async (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {
  
    let successEmbed = new discord.RichEmbed()
        .setColor(0xB8E986)
        .setTitle('✅ Operación completada')
        .setDescription('Deteniendo ' + bot.user.username + ' . . .'); 

    let loggingEmbed = new discord.RichEmbed()
        .setColor(0xFF773D)
        .setTimestamp()
        .setFooter(bot.user.username, bot.user.avatarURL)
        .setTitle('📑 Auditoría')
        .setDescription(message.author.username + ' detuvo a ' + bot.user.username + '. \nEl bot tendrá que ser arrancado manualmente');

    try {
        console.log(new Date().toUTCString() + ' 》Deteniendo ' + bot.user.username + ' a petición de ' + message.author.username);
        await message.channel.send(successEmbed);
        await loggingChannel.send(loggingEmbed);
        await bot.destroy();
        process.exit();
    } catch (e) {
        console.error(new Date().toUTCString() + ' 》' + e);
    }
    
}
