exports.run = (discord, fs, config, token, bot, message, args) => {

    let loggingChannel = bot.channels.get(config.loggingChannel);
    let supervisorsRole = message.guild.roles.get(config.botSupervisor);

    if(message.author.id == config.botOwner) {
        
        console.log(new Date() + " 》Deteniendo " + bot.user.username + " a petición de " + message.author.username);
       
        let embed = new discord.RichEmbed()
            .setColor(12118406)
            .setTitle("✅ Operación completada")
            .setDescription("Deteniendo " + bot.user.username + " . . .")

        message.channel.send({embed});

        embed = new discord.RichEmbed()
            .setColor(15806281)
            .setTimestamp()
            .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
            .setTitle("📑 Auditoría")
            .setDescription(message.author.username + " detuvo a " + bot.user.username + ". \nEl bot tendrá que ser arrancado manualmente");

        loggingChannel.send({embed})

        .catch ((err) => {
            console.error(new Date() + " 》" + err);

            let embed = new discord.RichEmbed()
                .setColor(15806281)
                .setTitle("❌ Ocurrió un error")
                .setDescription("Ocurrió un error durante la ejecución del comando")
            message.channel.send({embed})
        })

        bot.destroy();

    } else if (message.member.roles.has(supervisorsRole.id)){

        console.log(new Date() + " » Deteniendo " + bot.user.username + " a petición de " + message.author.username);

        let embed = new discord.RichEmbed()
            .setColor(12118406)
            .setTitle("✅ Operación completada")
            .setDescription("Deteniendo " + bot.user.username + ". . .")

        message.channel.send({embed});

        embed = new discord.RichEmbed()
            .setColor(15806281)
            .setTimestamp()
            .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
            .setTitle("📑 Auditoría")
            .setDescription(message.author.username + " detuvo a " + bot.user.username + ". \nEl bot tendrá que ser arrancado manualmente");

        loggingChannel.send({embed})

        .catch ((err) => {
            console.error(new Date() + " 》" + err);

            let embed = new discord.RichEmbed()
                .setColor(15806281)
                .setTitle("❌ Ocurrió un error")
                .setDescription("Ocurrió un error durante la ejecución del comando")
            message.channel.send({embed})
        })

        bot.destroy();

    } else {
        console.log (new Date() + " 》" + message.author.username + " no dispone de privilegios suficientes para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);

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
