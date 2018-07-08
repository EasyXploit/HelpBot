exports.run = (discord, fs, config, token, bot, message, args) => {

    let loggingChannel = bot.channels.get(config.loggingChannel);

    if(message.author.id == config.botOwner) {
        if(args.length >= 1) {
            if (args.length <= 1) {

                const newPrefix = message.content.split(" ").slice(1, 2)[0];
                config.prefix = newPrefix;

                fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);

                console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

                let embed = new discord.RichEmbed()
                    .setColor(12118406)
                    .setTitle("✅ Operación completada")
                    .setDescription("Cambiaste el prefijo a `" + newPrefix + "`")
                message.channel.send({embed});

                embed = new discord.RichEmbed()
                    .setColor(4886754)
                    .setTimestamp()
                    .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
                    .setTitle("📑 Auditoría")
                    .setDescription(message.author.username + " cambió el prefijo a `" + newPrefix + "`");
                loggingChannel.send({embed})

                .catch ((err) => {
                    console.error(new Date() + " 》" + err);

                    let embed = new discord.RichEmbed()
                        .setColor(15806281)
                        .setTitle("❌ Ocurrió un error")
                        .setDescription("Ocurrió un error durante la ejecución del comando")
                    message.channel.send({embed})
                })
            } else {
                console.log (new Date() + " 》" + message.author.username + " proporcionó demasiados argumentos para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);

                let embed = new discord.RichEmbed()
                    .setColor(15806281)
                    .setTitle("❌ Ocurrió un error")
                    .setDescription("Tan solo debes proporcionar un prefijo")
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
        } else {
            console.log (new Date() + " 》" + message.author.username + " no proporcionó suficientes argumentos para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);

            let embed = new discord.RichEmbed()
                .setColor(15806281)
                .setTitle("❌ Ocurrió un error")
                .setDescription("Debes proporcionar un prefijo")
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
