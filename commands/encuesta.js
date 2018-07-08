exports.run = (discord, fs, config, token, bot, message, args) => {
    
    let staffRole = message.guild.roles.get(config.botStaff);
    if(message.member.roles.has(staffRole.id)) {
        
        // Introduce los argumentos separados por " en el array 'fields'
        var fields = message.content.slice(11).split('" "');
        var lastField = fields.slice(-1).join();
        
        lastField = lastField.substring(0, lastField.length - 1);
        fields.splice(-1);
        fields.push(lastField);

        if (fields.length >= 2) {
            if (fields.length <= 11) {
                console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
                
                message.delete();

                let count = 2;
                let lines = fields [1];
                var emojiOptions = [":one:", ":two:", ":three:", ":four:", ":five:", ":six:", ":seven:", ":eight:", ":nine:", ":keycap_ten:"]
                var UTFemojis = ["\u0030\u20E3", "\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3", "\u0036\u20E3", "\u0037\u20E3", "\u0038\u20E3", "\u0039\u20E3", "\u0030\u20E3"]

                while (count < fields.length) {
                    lines = lines + " \n" + emojiOptions[count - 1] + " " + fields[count];
                    count = count + 1;
                }

                let embed = new discord.RichEmbed()
                    .setColor(4895458)
                    .setTitle(":bar_chart:  **" + fields[0] + "** \n\n")
                    .setDescription(":one: " + lines)
                    .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
                message.channel.send({embed})
                
                .then(async function (message) {
                    for (c = 1; c < fields.length; c++) {
                        await message.react(UTFemojis[c]);
                    }
                })
                
                .catch ((err) => {
                    console.error(new Date() + " 》" + err);

                    let embed = new discord.RichEmbed()
                        .setColor(15806281)
                        .setTitle("❌ Ocurrió un error")
                        .setDescription("Ocurrió un error durante la ejecución del comando")
                    message.channel.send({embed})
                })
                
                count = 0;
            } else {
                console.log (new Date() + " 》" + message.author.username + " proporcionó demasiados argumentos para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);
                
                let embed = new discord.RichEmbed()
                    .setColor(15806281)
                    .setTitle("❌ Ocurrió un error")
                    .setDescription(message.author.username + ", tan solo puedes añadir un máximo de 10 opciones")
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
                .setDescription(message.author.username + ", debes proporcionar un título para la encuesta y al menos una opción \n(asegúrate de que no haya más de un espacio en blanco entre los campos)")
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
