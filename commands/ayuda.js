exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //!ayuda
    
    try {
        let embed = new discord.RichEmbed()
        .setColor(0xFFC857)
        .setAuthor('AYUDA', 'http://i.imgur.com/sYyH2IM.png')
        .setTitle('Sistema de ayuda del servidor')
        .setThumbnail('http://i.imgur.com/sYyH2IM.png')
        .setFooter('© 2018 República Gamer LLC', message.guild.iconURL)

        .addField(':grey_question: ' + config.prefix + 'normas', 'Muestra las normas del servidor.', true)
        .addField(emojis.pilkobot + ' ' + config.prefix + 'pilko', 'Muestra los comandos de <@446041159853408257> ', true)
        .addField(':robot: ' + config.prefix + 'comandos', 'Muestra los comandos de los bots.', true)
        .addField(':medal: ' + config.prefix + 'rangos', 'Muestra la lista de rangos ' + emojis.beta + '.', true)
        .addField(':medal: !rank', 'Muestra tu rango en el servidor (o el de otro usuario).', true)
        .addField(':trophy: !levels', 'Muestra la tabla de clasificación del servidor.', true)
        .addField(':ticket: +invites', 'Muestra a cuentas personas has invitado.', true)
        .addField('📈 +leaderboard', 'Muestra la tabla de clasificación de invitaciones.', true)
        .addField(':stopwatch: ' + config.prefix + 'ping', 'Comprueba el tiempo de respuesta entre el cliente y ' + bot.user.username, true)
    message.channel.send(embed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
