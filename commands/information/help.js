exports.run = async (client, message, args, command, commandConfig) => {
    
    //!help
    
    const packageInfo = require('../../package.json');
    
    try {
        message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setAuthor({ name: packageInfo.normalizedName, iconURL: client.user.avatarURL() })
            .setTitle(packageInfo.normalizedName)
            .setURL(packageInfo.homepage)
            .setThumbnail(client.user.avatarURL())
            .setDescription(`${packageInfo.description}\n➣Usa el comando \`${client.config.guild.prefix}commands\` para descubrir el resto de comandos.`)
            .addField('✉ Licencia', 'Este proyecto no tiene licencia, por lo que se aplican las leyes de copyright predeterminadas, lo que significa que conservamos todos los derechos de nuestro código fuente y que nadie puede reproducir, distribuir o crear trabajos derivados de este.')
            .addField('✉ Agradecimientos', '● Maria José Lozano\n● Amish Shah\n● El Pilko (Carlos)', true)
            .addField('📊 Estadísticas', `${await client.homeGuild.members.fetch().then(members => members.filter(member => !member.user.bot).size)} miembros\nV ${packageInfo.version}`, true)
            .addField('🗂 Librerias', '● discord.js\n● flaticon', true)
        ]});
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'help',
    aliases: ['info', 'support']
};
