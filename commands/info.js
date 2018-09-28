exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //!info
    
    try {
        let resultEmbed = new discord.RichEmbed()
            .setColor(0XFFC857)
            .setAuthor('La República Gamer', bot.user.avatarURL)
            .setThumbnail('https://i.imgur.com/cTW63kf.png')
            .setURL('https://discord.gg/eWx72Jy')
            .setTitle('República Gamer LLC')
            .setFooter('©2018 República Gamer LLC', bot.user.avatarURL)
            .addField('El proyecto', 'La República Gamer nació de la curiosidad. El objetivo era crear un pequeño servidor tan solo para un pocos amigos, pero al ver las posibilidades que Discord ofrecía, el servidor fue escalado hasta convertirse en la comunidad que conocemos hoy en día.', true)
            .addField('La comunidad', 'La **República Gamer** es una comunidad creada _por y para jugadores_.\nNuestro objetivo es darnos a conocer entre toda la comunidad gamer a fin de conectar a jugadores con otros jugadores. Realizamos sorteos, troneos y proporcionamos sistemas para conectar a los usuarios.', true)
            .addField('PilkoBot', '**' + bot.user.username + '** es un bot multifuncional desarrollado por el Staff de la comunidad, cuyo uso es exclusivo de los usuarios de la **República Gamer**, por lo que no está permitido su uso fuera de los servidores administrador por la **República Gamer LLC**.\n\n_Para más información relativa a las funcionalidades de este bot, escribe `' + config.prefix + 'ayuda`_', true)
            .addField('Agradecimientos', '● Maria José Lozano\n● Amish Shah\n● El Pilko\n', true);
        message.channel.send(resultEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
