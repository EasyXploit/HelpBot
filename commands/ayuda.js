exports.run = (discord, fs, config, token, bot, message, args, command) => {

    const beta = bot.emojis.find('name', 'beta');   

    let embed = new discord.RichEmbed()
        .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
        .setTitle('Sistema de ayuda del servidor')

        .setColor(0xFFC857)
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .setThumbnail('http://i.imgur.com/sYyH2IM.png')

        .addField(':grey_question: ' + config.prefix + 'normas', 'Muestra las normas del servidor.', true)
        .addField(':robot: ' + config.prefix + 'comandos', 'Muestra los comandos de los bots.', true)
        .addField(':medal: ' + config.prefix + 'rangos', 'Muestra la lista de rangos ' + beta + '.', true)
        .addField(':medal: !rank', 'Muestra tu rango en el servidor (o el de otro usuario).', true)
        .addField(':trophy: !levels', 'Muestra la tabla de clasificación del servidor.', true)
        .addField(':stopwatch: ' + config.prefix + 'ping', 'Comprueba el tiempo de respuesta entre el cliente y ' + bot.user.username, true)
        .addField('🔰 ' + config.prefix + 'staff', 'Muestra la lista de comandos para el Staff', true);
    message.channel.send(embed);
}
