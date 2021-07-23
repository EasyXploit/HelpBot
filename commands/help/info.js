exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!info
    
    const packageInfo = require('../package.json');
    
    try {
        let resultEmbed = new discord.MessageEmbed()
            .setColor(client.colors.primary)
            .setAuthor(packageInfo.normalizedName, client.user.avatarURL())
            .setTitle(packageInfo.normalizedName)
            .setURL(packageInfo.homepage)
            .setThumbnail(client.user.avatarURL())
            .setDescription(packageInfo.description)
            .addField('✉ Licencia', 'Este proyecto no tiene licencia, por lo que se aplican las leyes de copyright predeterminadas, lo que significa que conservamos todos los derechos de nuestro código fuente y que nadie puede reproducir, distribuir o crear trabajos derivados de este.')
            .addField('✉ Agradecimientos', '● Maria José Lozano\n● Amish Shah\n● El Pilko (Carlos)', true)
            .addField('📊 Estadísticas', `${client.homeGuild.members.cache.filter(member => !member.user.bot).size} miembros\nV ${packageInfo.version}`, true)
            .addField('🗂 Librerias', '● discord.js\n● flaticon', true);
        message.channel.send(resultEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'info',
    aliases: ['information']
};
