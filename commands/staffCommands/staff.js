exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {

    message.delete();

    const pokeball = bot.emojis.find('name', 'pokeball');
    const beta = bot.emojis.find('name', 'beta');

    let successEmbed = new discord.RichEmbed()
        .setAuthor('STAFF', 'http://i.imgur.com/l0EinOe.png')
        .setTitle('Comandos para el Staff del servidor')

        .setColor(0x1A936F)
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .setThumbnail('http://i.imgur.com/l0EinOe.png')

        .addField('🔄 ' + config.staffPrefix + 'reiniciar', 'Reinicia a ' + bot.user.username, true)
        .addField(':stop_button: ' + config.supervisorsPrefix + 'detener', 'Detiene a ' + bot.user.username + ' :key:', true)
        .addField('🕐 ' + config.staffPrefix + 'uptime', 'Muestra el tiempo que ' + bot.user.username + ' ha permanecido en línea', true)
        .addField('🙍 ' + config.staffPrefix + 'infousuario <@usuario>', 'Muestra información acerca del usuario mencionado', true)
        .addField('🖥 ' + config.staffPrefix + 'infoservidor', 'Muestra información acerca de la guild actual', true)
        .addField('🔖 ' + config.staffPrefix + 'inforol <@rol/nombre/id>', 'Muestra información acerca de un rol', true)
        .addField('🔈 ' + config.staffPrefix + '&silenciar (@mención/id) (motivo)', 'Silencia a un usuario', true)
        .addField('🔊 ' + config.staffPrefix + '&dessilenciar (@mención/id) (motivo)', 'Des-silencia a un usuario', true)
        .addField('🔧 ' + config.staffPrefix + 'herramientas', 'Muestra las herramientas de moderación que proporciona <@159985870458322944>', true)
        .addField('🔖 ' + config.supervisorsPrefix + 'añadir-rol <@rol> <@usuario>', 'Añade un determinado rol a un determinado usuario :key:', true)
        .addField('🔖 ' + config.supervisorsPrefix + 'quitar-rol <@rol> <@usuario>', 'Retira un determinado rol a un determinado usuario :key:', true)
        .addField('💭 ' + config.staffPrefix + 'envia <mensaje>', 'Envía un mensaje desde ' + bot.user.username, true)
        .addField('📊 ' + config.staffPrefix + 'encuesta <"título"> <"campo1"> ["campo2"] ...', 'Envia una encuesta al canal actual', true)
        .addField(pokeball + ' ' + config.staffPrefix + 'spawn <"url">', 'Spawnea un pokémon en base a la URL de imágen proporcionada', true);
    message.author.send(successEmbed);
}
