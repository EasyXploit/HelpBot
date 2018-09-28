exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //!dado
    
    try {
        const coin = bot.emojis.find('name', 'coin');
        const datos = ['1', '2', '3', '4', '5', '6'];

        const resultEmbed = new discord.RichEmbed()
            .setColor(0xDDDDDD)
            .setTitle('Lanzaste un dado ...  🎲')
            .setDescription('¡Salió **' + datos[Math.floor(Math.random() * datos.length)] + '**!');
        message.channel.send(resultEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
