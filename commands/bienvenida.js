exports.run = (discord, fs, config, token, bot, message, args) => {

    let loggingChannel = bot.channels.get(config.loggingChannel);
    let welcomeChannel = bot.channels.get(config.welcomeChannel);

    if(message.author.id == config.botOwner) {
        if(args.length >= 1) {
            if (args.length <= 1) {
                if (message.mentions.channels = true) {  //Actualmente no funciona, por lo que el IF ignorará la condición por el momento (prototipo: message.mentions.channels === true)

                    let channelMention = args[0];
                    channelMention = channelMention.substring(2, channelMention.length - 1);

                    //const newLoggingChannel = message.content.split(" ").slice(1, 2)[0];
                    config.welcomeChannel = channelMention;

                    fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);

                    console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

                    let embed = new discord.RichEmbed()
                        .setColor(12118406)
                        .setTitle("✅ Operación completada")
                        .setDescription("Cambiaste el canal de bienvenida a " + args[0])
                    message.channel.send({embed});

                    embed = new discord.RichEmbed()
                        .setColor(4886754)
                        .setTimestamp()
                        .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
                        .setTitle("📑 Auditoría")
                        .setDescription(message.author.username + " cambió el canal de bienvenida a " + args[0]);
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
                    console.log (new Date() + " 》" + message.author.username + " no proporcionó un canal de texto válido para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);

                    let embed = new discord.RichEmbed()
                        .setColor(15806281)
                        .setTitle("❌ Ocurrió un error")
                        .setDescription("No has proporcionado un canal de texto válido ")
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
                console.log (new Date() + " 》" + message.author.username + " proporcionó demasiados argumentos para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);

                let embed = new discord.RichEmbed()
                    .setColor(15806281)
                    .setTitle("❌ Ocurrió un error")
                    .setDescription("Proporcionaste demasiados argumentos.\nTan solo debes proporcionar un ID de canal")
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
                .setDescription("Debes proporcionar un ID de canal")
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
