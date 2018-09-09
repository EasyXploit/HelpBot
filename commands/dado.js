exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {

    const coin = bot.emojis.find('name', 'coin');
    const datos = ['1', '2', '3', '4', '5', '6'];
    
    const successEmbed = new discord.RichEmbed()
        .setTitle('Lanzaste un dado ...  🎲')
        .setColor(0xDDDDDD)
        .setDescription('¡Salió **' + datos[Math.floor(Math.random() * datos.length)] + '**!');
    message.channel.send(successEmbed);
}
