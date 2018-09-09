exports.run = (discord, fs, config, token, bot, message, args, command, roles, loggingChannel) => {
    
    message.delete();

    const beta = bot.emojis.find('name', 'beta');

    let successEmbed = new discord.RichEmbed()
        .setAuthor('MODERACIÓN', 'https://i.imgur.com/LkFUg91.png')
        .setTitle('Comandos de moderación del servidor')

        .setColor(0xFEF65B)
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .setThumbnail('https://i.imgur.com/LkFUg91.png')

        .addField('🛡 !ban <@usuario> [motivo]', 'Banea a un usuario :key:')
        .addField('🕑 !tempban <@usuario> [motivo]', 'Banea a un usuario temporalmente :key:')
        .addField('🔄 !kick <@usuario> [motivo]', 'Expulsa a un usuario :key:')
        .addField('⏱ !tempkick <@usuario> [motivo]', 'Expulsa a un usuario temporalmente :key:')
        .addField('🔇 !mute <@usuario> [motivo]', 'Silencia a un usuario :key:')
        .addField('🔈 !tempmute <@usuario> [motivo]', 'Silencia a un usuario temporalmente')
        .addField('🔊 !unmute <@usuario>', 'Des-silencia a un usuario :key:')
        .addField('🔔 !warn <@usuario> [advertencia]', 'Advierte a un usuario')
        .addField('⚖ !infractions <@usuario>', 'Comprueba el historial de infracciones de un usuario')
        .addField('🔄 !clear <@canal>', 'Borra los mensajes de un canal :key:')
        .addField('🚥 !slowmode <@canal>', 'Habilita el cooldown de mensajería de un canal :key:')
        .addField('🙍 ~~!user-info <@usuario>~~', '~~Muestra información acerca de un usuario~~')
        .addField('📃 !server-info', 'Muestra información acerca de este servidor :key:')
        .addField('🔖 !role-info <@rol>', 'Muestra información acerca de un rol :key:')
    message.author.send(successEmbed);
}
