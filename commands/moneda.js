exports.run = (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!moneda
    
    try {
        const datos = ['CARA', 'CARA', 'CARA', 'CARA', 'CARA', 'CRUZ', 'CRUZ', 'CRUZ', 'CRUZ', 'CRUZ', 'CANTO.. ¿CANTO?'];

        const resultEmbed = new discord.MessageEmbed()
            .setColor(0xEAE151)
            .setTitle(`Lanzaste una moneda ...  ${resources.coin}`)
            .setDescription(`¡Salió __**${datos[Math.floor(Math.random() * datos.length)]}**__!`);
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
