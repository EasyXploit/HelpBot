exports.run = (event, discord, fs, config, token, bot) => {

    const loggingChannel = bot.channels.get(config.loggingChannel);

    console.log(new Date() + ' 》' + bot.user.username + ' se unió a la guild: ' + event.name)

    let embed = new discord.RichEmbed()
        .setColor(0xF74022)
        .setTimestamp()
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .addField('📑 Auditoría', bot.user.username + ' se unió a la guild: **' + event.name + '**\nPor el momento, ' + bot.user.username + ' no está preparado para ser ejecutado en más de una guild, por lo que este podría no responder correctamente. Se recomienda que ' + bot.user.username + ' permaneza en un único servidor.');
    loggingChannel.send(embed);
}
