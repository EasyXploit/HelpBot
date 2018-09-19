exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {

    let restartingEmbed = new discord.RichEmbed()
        .setColor(12118406)
        .setTitle('✅ Operación completada')
        .setDescription('Reiniciando PilkoBot . . .');
    message.channel.send(restartingEmbed);

    let loggingEmbed = new discord.RichEmbed()
        .setColor(4886754)
        .setTimestamp()
        .setFooter(bot.user.username, bot.user.avatarURL)
        .setTitle('📑 Auditoría')
        .setDescription(message.author.username + ' reinició a ' + bot.user.username);

    try {
        // Destrucción de la actividad
        bot.destroy();
        console.log(new Date().toUTCString() + ' 》Deteniendo ' + bot.user.username + ' . . .');
        try {
             // Inicio de sesión del bot
            bot.login(keys.token);
            console.log(new Date() + ' 》Iniciando ' + bot.user.username + ' . . .\n');
            loggingChannel.send(loggingEmbed);
        } catch (e) {
            console.error(new Date().toUTCString() + ' 》' + e);
        }
    } catch (e) {
        console.error(new Date().toUTCString() + ' 》' + e);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle('❌ Ocurrió un error')
            .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
        message.channel.send(errorEmbed);
    }
}
