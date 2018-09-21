exports.run = (event, discord, fs, config, keys, bot) => {

    const loggingChannel = bot.channels.get(config.loggingChannel);
    
    if (!event.user.bot) {
        console.log(new Date() + ' 》@' + event.user.username + ' abandonó la República Gamer');

        let embed = new discord.RichEmbed()
            .setColor(0xDB904D)
            .setTimestamp()
            .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
            .addField('📑 Auditoría', '@' + event.user.username + ' abandonó la República Gamer ↗');
        loggingChannel.send(embed);
    } else {
        let loggingGoodbyeBotEmbed = new discord.RichEmbed()
            .setColor(0xDB904D)
            .setTimestamp()
            .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
            .addField('📑 Auditoría', 'El **BOT** @' + event.user.tag + ' fue eliminado del servidor ↗');
        loggingChannel.send(loggingGoodbyeBotEmbed)
        return;
    }
}
