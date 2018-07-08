exports.run = (discord, fs, config, token, bot, message, args) => {

    let staffRole = message.guild.roles.get(config.botStaff);

    if(message.member.roles.has(staffRole.id)) {

        console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);

        let embed = new discord.RichEmbed()
            .setAuthor("STAFF", "http://i.imgur.com/l0EinOe.png")
            .setTitle("Comandos para el Staff del servidor")

            .setColor(16762967)
            .setFooter("© 2018 República Gamer LLC", bot.user.avatarURL)
            .setThumbnail("http://i.imgur.com/l0EinOe.png")

            .addField("🔄 !reiniciar", "Reinicia a " + bot.user.username, true)
            .addField(":stop_button: !detener", "Detiene a " + bot.user.username, true)
            .addField("👋 !bienvenida [ID de canal]", "Cambia el canal de bienvenida", true)
            .addField("📑 !auditoria [ID de canal]", "Cambia el canal de auditoría", true)
            .addField("📌 !prefijo [nuevo prefijo]", "Cambia el prefijo de " + bot.user.username, true)
            .addField('📊 !encuesta ["título"] ["campo1"] {"campo2"} ...', 'Envia una encuesta al canal actual', true)
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
