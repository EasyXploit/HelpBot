exports.run = (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!info
    
    const package = require('../package.json');
    const cfg = require('../config.json');
    
    try {
        let resultEmbed = new discord.MessageEmbed()
            .setColor(resources.gold)
            .setAuthor('La República Gamer', client.user.avatarURL())
            .setThumbnail('https://i.imgur.com/cTW63kf.png')
            .setURL(cfg.serverInvite)
            .setTitle('República Gamer S.L.')
            .setFooter(`© ${new Date().getFullYear()} República Gamer S.L.`, resources.server.iconURL())
            .addField(`${resources.pilkobot} PilkoBot`, `**${client.user.username}** es un bot multifuncional desarrollado por el Staff de la comunidad, cuyo uso es exclusivo de los usuarios de la **República Gamer**.\n\nEste proyecto no tiene licencia, por lo que se aplican las leyes de copyright predeterminadas, lo que significa que conservamos todos los derechos de nuestro código fuente y que nadie puede reproducir, distribuir o crear trabajos derivados de este.\n\n_Para más información relativa a las funcionalidades de este bot, usa el comando \`${config.prefix}ayuda\`_`)
            .addField('✉ Agradecimientos', '● Maria José Lozano\n● Amish Shah\n● El Pilko (Carlos)', true)
            .addField('📊 Estadísticas', `${client.guilds.cache.size} servidores\n${client.users.cache.filter(user => !user.bot).size} usuarios\nV ${package.version}`, true)
            .addField('🗂 Librerias', '● discord.js\n● flaticon', true);
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
