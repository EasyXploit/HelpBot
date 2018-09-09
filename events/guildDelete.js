exports.run = (event, discord, fs, config, keys, bot) => {

    const loggingChannel = bot.channels.get(config.loggingChannel);

    console.log(new Date() + ' 》' + bot.user.username + ' abandonó a la guild: ' + event.name)

    let embed = new discord.RichEmbed()
        .setColor(0xDB904D)
        .setTimestamp()
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .addField('📑 Auditoría', bot.user.username + ' abandonó a la guild: **' + event.name + '**');
    loggingChannel.send(embed);
}
