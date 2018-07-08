exports.run = (discord, fs, config, token, bot, message, args) => {

    let loggingChannel = bot.channels.get(config.loggingChannel);
    let staffRole = message.guild.roles.get(config.botStaff);

    if(message.member.roles.has(staffRole.id)) {

        let embed = new discord.RichEmbed()
            .setColor(12118406)
            .setTitle("✅ Operación completada")
            .setDescription("Reiniciando PilkoBot . . .")
        message.channel.send({embed})

        embed = new discord.RichEmbed()
            .setColor(4886754)
            .setTimestamp()
            .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
            .setTitle("📑 Auditoría")
            .setDescription(message.author.username + " reinició a " + bot.user.username);
        loggingChannel.send({embed})

        .catch ((err) => {
            console.error(new Date() + " 》" + err);

            let embed = new discord.RichEmbed()
                .setColor(15806281)
                .setTitle("❌ Ocurrió un error")
                .setDescription("Ocurrió un error durante la ejecución del comando")
            message.channel.send({embed})
        })

        // Destrucción de la actividad
        bot.destroy();
        console.log(new Date() + " 》Deteniendo " + bot.user.username + " . . .")

        // Inicio de sesión del bot
        bot.login(config.token);
        console.log(new Date() + " 》Iniciando " + bot.user.username + " . . .")

    } else {
        console.log (new Date() + " 》" + message.author.username + " no dispone de privilegios suficientes para ejecutar el comando:  " + message.content + "  en  " + message.guild.name)

        let embed = new discord.RichEmbed()
            .setColor(15806281)
            .setTitle("❌ Ocurrió un error")
            .setDescription(message.author.username + ", no dispones de privilegios suficientes para ejecutar este comando")

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
