exports.run = (event, discord, fs, config, token, bot) => {

    if (!event.user.bot) {

        const beta = bot.emojis.find("name", "beta");

        let loggingChannel = bot.channels.get(config.loggingChannel);
        let welcomeChannel = bot.channels.get(config.welcomeChannel);

        console.log(new Date() + " 》" + event.user.username + " se unió a la República Gamer")

        let embed = new discord.RichEmbed()
            .setColor(16762967)
            .setAuthor("Bienvenido a la República Gamer", "https://i.imgur.com/LVmSQns.jpg")

            .setDescription("Hola <@" + event.user.id + ">, bienvenid@ a la **República Gamer**. Recuerda leer la <#426464733764386828>\nPor lo demás, ¡Pásalo bien :wink:!  " + beta)
            .setThumbnail("https://i.imgur.com/lDuMuSb.png")
        welcomeChannel.send({embed})

        embed = new discord.RichEmbed()
            .setColor(10020422)
            .setTimestamp()
            .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
            .addField("📑 Auditoría", "<@" + event.user.id + "> se unió a la República Gamer ↙");
        loggingChannel.send({embed})

        .catch ((err) => {
            console.error(new Date() + " 》" + err);

            let embed = new discord.RichEmbed()
                .setColor(15806281)
                .setTitle("❌ Ocurrió un error")
                .setDescription("Ocurrió un error durante la ejecución del evento " + event)
            loggingChannel.send({embed})
        })
    } else {
        return;
    }
}
