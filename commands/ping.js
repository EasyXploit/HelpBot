exports.run = (discord, fs, config, token, bot, message, args) => {

    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

    let ping = new Date().getTime() - message.createdTimestamp;

    if (ping <= 180) {
        let embed = new discord.RichEmbed()
          .setTitle("Tiempo de respuesta: ")

          .setColor(8311585)
          .setDescription(":stopwatch: | " + ping + " ms")
        message.channel.send({embed})

        .catch ((err) => {
            console.error(new Date() + " 》" + err);

            let embed = new discord.RichEmbed()
                .setColor(15806281)
                .setTitle("❌ Ocurrió un error")
                .setDescription("Ocurrió un error durante la ejecución del comando")
            message.channel.send({embed})
        })
    } else if (ping > 180 && ping <= 250) {
        let embed = new discord.RichEmbed()
          .setTitle("Tiempo de respuesta: ")

          .setColor(16098851)
          .setDescription(":stopwatch: | " + ping + " ms")
        message.channel.send({embed})

        .catch ((err) => {
            console.error(new Date() + " 》" + err);

            let embed = new discord.RichEmbed()
                .setColor(15806281)
                .setTitle("❌ Ocurrió un error")
                .setDescription("Ocurrió un error durante la ejecución del comando")
            message.channel.send({embed})
        })
    } else {
        let embed = new discord.RichEmbed()
          .setTitle("Tiempo de respuesta: ")

          .setColor(15806281)
          .setDescription(":stopwatch: | " + ping + " ms")
        message.channel.send({embed})

        .catch ((err) => {
            console.error(new Date() + " 》" + err);

            let embed = new discord.RichEmbed()
                .setColor(15806281)
                .setTitle("❌ Ocurrió un error")
                .setDescription("Ocurrió un error durante la ejecución del comando")
            message.channel.send({embed})
        })
    }
}
