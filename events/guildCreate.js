exports.run = (event, discord, fs, config, token, bot) => {

    let loggingChannel = bot.channels.get(config.loggingChannel);

    console.log(new Date() + " 》" + bot.user.username + " se unió a la guild: " + event.name)

    let embed = new discord.RichEmbed()
        .setColor(16203810)
        .setTimestamp()
        .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
        .addField("📑 Auditoría", bot.user.username + " se unió a la guild: **" + event.name + "**\nPor el momento, " + bot.user.username + " no está preparado para el multi-sharding, por lo que este podría no responder correctamente. Se recomienda que " + bot.user.username + " permaneza en un único servidor.");
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
