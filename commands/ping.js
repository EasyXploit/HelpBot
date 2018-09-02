exports.run = (discord, fs, config, token, bot, message, args, command) => {

    const ping = new Date().getTime() - message.createdTimestamp;

    if (ping <= 180) {
        let greenEmbed = new discord.RichEmbed()
          .setTitle('Tiempo de respuesta: ')
          .setColor(0x7ED321)
          .setDescription(':stopwatch: | ' + ping + ' ms');
        message.channel.send(greenEmbed);
    } else if (ping > 180 && ping <= 250) {
        let orangeEmbed = new discord.RichEmbed()
          .setTitle('Tiempo de respuesta: ')
          .setColor(0xF5A623)
          .setDescription(':stopwatch: | ' + ping + ' ms');
        message.channel.send(orangeEmbed);
    } else {
        let redEmbed = new discord.RichEmbed()
          .setTitle('Tiempo de respuesta: ')
          .setColor(0xF12F49)
          .setDescription(':stopwatch: | ' + ping + ' ms');
        message.channel.send(redEmbed);
    }
}
