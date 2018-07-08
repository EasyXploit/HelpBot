exports.run = (event, discord, fs, config, token, bot) => {

    let loggingChannel = bot.channels.get(config.loggingChannel);

    console.log(new Date() + " 》" + bot.user.username + " abandonó a la guild: " + event.name)

    let embed = new discord.RichEmbed()
        .setColor(14389325)
        .setTimestamp()
        .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
        .addField("📑 Auditoría", bot.user.username + " abandonó a la guild: **" + event.name + "**");
    loggingChannel.send({embed})

    .catch ((err) => {
        console.error(new Date() + " 》" + err);

        let embed = new discord.RichEmbed()
            .setColor(15806281)
            .setTitle("❌ Ocurrió un error")
            .setDescription("Ocurrió un error durante la ejecución del evento " + event)
        loggingChannel.send({embed})
    })
}
