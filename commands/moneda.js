exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //!moneda
    
    try {
        const datos = ['CARA', 'CRUZ'];

        const resultEmbed = new discord.RichEmbed()
            .setColor(0xEAE151)
            .setTitle('Lanzaste una moneda ...  ' + emojis.coin)
            .setDescription('¡Salió __**' + datos[Math.floor(Math.random() * datos.length)] + '**__!');
        message.channel.send(resultEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
