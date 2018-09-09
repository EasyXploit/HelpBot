exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {

    const coin = bot.emojis.find('name', 'coin');
    const datos = ['CARA', 'CRUZ'];
    
    const successEmbed = new discord.RichEmbed()
        .setTitle('Lanzaste una moneda ...  ' + coin)
        .setColor(0xEAE151)
        .setDescription('¡Salió __**' + datos[Math.floor(Math.random() * datos.length)] + '**__!');
    message.channel.send(successEmbed);
}
