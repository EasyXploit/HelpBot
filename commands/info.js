exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!info
    
    const package = require('../package.json');
    
    try {
        let resultEmbed = new discord.MessageEmbed ()
            .setColor(0XFFC857)
            .setAuthor('La República Gamer', bot.user.avatarURL())
            .setThumbnail('https://i.imgur.com/cTW63kf.png')
            .setURL('https://discord.gg/eWx72Jy')
            .setTitle('República Gamer S.L.')
            .setFooter('©2020 República Gamer S.L.', resources.server.iconURL())
            .addField(resources.pilkobot + ' PilkoBot', '**' + bot.user.username + '** es un bot multifuncional desarrollado por el Staff de la comunidad, cuyo uso es exclusivo de los usuarios de la **República Gamer**, por lo que no está permitido su uso fuera de los servidores administrados por la **República Gamer S.L.**.\n\n_Para más información relativa a las funcionalidades de este bot, usa el comando `' + config.prefix + 'ayuda`_')
            .addField('✉ Agradecimientos', '● Maria José Lozano\n● Amish Shah\n● El Pilko (Carlos)\n', true)
            .addField('📊 Estadísticas', bot.guilds.size + ' servidores\n' + bot.users.filter(user => !user.bot).size + ' usuarios\nV ' + package.version, true)
            .addField('🔗 Añádeme', '___Aún no disponible___', true)
            .addField('💬 Servidor', '[Únete](' + config.serverInvite + ')', true)
            .addField('📣 Twitter', '___Aún no disponible___', true)
            .addField('🗂 Librerias', '● discord.js\n● flaticon\n● Giphy', true);
        message.channel.send(resultEmbed);
    } catch (e) {
        require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
