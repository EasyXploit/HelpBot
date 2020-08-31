exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //-restart
    
    try {
        let restartingEmbed = new discord.MessageEmbed ()
            .setColor(12118406)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription('Reiniciando PilkoBot . . .');
        message.channel.send(restartingEmbed);

        let loggingEmbed = new discord.MessageEmbed ()
            .setColor(4886754)
            .setTimestamp()
            .setFooter(bot.user.username, bot.user.avatarURL())
            .setTitle('📑 Auditoría')
            .setDescription(`**${message.author.tag}** reinició a **${bot.user.username}**`);

        // Destrucción de la actividad
        bot.destroy();
        console.log(`${new Date().toLocaleString()} 》Deteniendo ${bot.user.username} . . .`);
        
         // Inicio de sesión del bot
        bot.login(keys.token);
        console.log(`${new Date().toLocaleString()} 》Iniciando ${bot.user.username} . . .\n`);
        bot.emit('ready');
        loggingChannel.send(loggingEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
