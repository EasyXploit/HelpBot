exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //-reiniciar
    
    try {
        let restartingEmbed = new discord.RichEmbed()
            .setColor(12118406)
            .setTitle(emojis.GreenTick + ' Operación completada')
            .setDescription('Reiniciando PilkoBot . . .');
        message.channel.send(restartingEmbed);

        let loggingEmbed = new discord.RichEmbed()
            .setColor(4886754)
            .setTimestamp()
            .setFooter(bot.user.username, bot.user.avatarURL)
            .setTitle('📑 Auditoría')
            .setDescription('**' + message.author.tag + '** reinició a **' + bot.user.username + '**');

        // Destrucción de la actividad
        bot.destroy();
        console.log(new Date().toUTCString() + ' 》Deteniendo ' + bot.user.username + ' . . .');
        
         // Inicio de sesión del bot
        bot.login(keys.token);
        console.log(new Date() + ' 》Iniciando ' + bot.user.username + ' . . .\n');
        loggingChannel.send(loggingEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
