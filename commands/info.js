exports.run = (discord, client, message, args, command) => {
    
    //!info
    
    const packageInfo = require('../package.json');
    
    try {
        let resultEmbed = new discord.MessageEmbed()
            .setAuthor('La República Gamer', client.user.avatarURL())
            .setThumbnail('https://i.imgur.com/cTW63kf.png')
            .setURL(client.config.guild.serverInvite)
            .setTitle('República Gamer S.L.')
            .addField(`${client.emotes.pilkobot} ${client.user.username}`, `**${client.user.username}** es un bot multifuncional para Discord desarrollado por el Staff de **República Gamer**, cuyo uso a fecha de publicación de este documento es exclusivo de los usuarios de dicha comunidad.\n\nEste proyecto no tiene licencia, por lo que se aplican las leyes de copyright predeterminadas, lo que significa que conservamos todos los derechos de nuestro código fuente y que nadie puede reproducir, distribuir o crear trabajos derivados de este.\n\n_Para más información relativa a las funcionalidades de este bot, usa el comando \`${client.config.prefixes.mainPrefix}ayuda\`_`)
            .setColor(client.colors.primary)
            .addField('✉ Agradecimientos', '● Maria José Lozano\n● Amish Shah\n● El Pilko (Carlos)', true)
            .addField('📊 Estadísticas', `${client.guilds.cache.size} servidores\n${client.users.cache.filter(user => !user.bot).size} miembros\nV ${package.version}`, true)
            .addField('🗂 Librerias', '● discord.js\n● flaticon', true);
        message.channel.send(resultEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};
