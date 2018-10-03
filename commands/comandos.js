exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!comandos
    
    try {
        let helpEmbed = new discord.RichEmbed()
            .setColor(16762967)
            .setThumbnail('http://i.imgur.com/g31RYSS.png')
            .setAuthor('COMANDOS', 'http://i.imgur.com/E3nPnZY.png')
            .setTitle('Comandos de los bots del servidor')
            .setFooter('© 2018 República Gamer LLC', message.guild.iconURL)
            .addField(resources.pilkobot + ' ' + config.prefix + 'pilko', 'Muestra los comandos de <@446041159853408257> ', true)
            .addField(':zap: ' + config.prefix + 'salas', 'Muestra la ayuda para crear salas personalizadas.', true)
            .addField(':musical_note: ' + config.prefix + 'musica', 'Muestra la ayuda para reproducir música en las salas de voz.', true)
            .addField('🎶 ' + config.prefix + 'dj', 'Muestra los comandos para controlar la música (solo DJs) ' + resources.beta + '.', true)
            .addField(':fire: ' + config.prefix + 'tatsumaki', 'Muestra la ayuda para <@172002275412279296>.', true)
            .addField(':performing_arts: ' + config.prefix + 'memes', 'Muestra la ayuda para enviar memes y efectos sonoros.', true)
            .addField(':package: ' + config.prefix + 'boxbot', 'Muestra la ayuda para jugar a <@413728456942288896> en <#433376010688397312> y <#435495241840328705>', true)
            .addField(resources.pokeball +  ' ' + config.prefix + 'pokecord', 'Muestra la ayuda para jugar a <@365975655608745985> en <#433376047833022513> ', true);
        message.channel.send(helpEmbed);
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
